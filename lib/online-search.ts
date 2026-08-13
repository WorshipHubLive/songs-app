export interface OnlineSearchResult {
  title: string;
  artist: string;
  lyrics: string;
  source: string;
  stage: number;
}

export interface StageSearchResult {
  results: OnlineSearchResult[];
  currentStage: number;
  nextStage: number | null;
  sourceName: string;
}

const TIMEOUT_MS = 6000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

// STAGE 1: direct search on lrclib.net with "title - artist"
async function searchStage1Lrclib(title: string, artist: string): Promise<OnlineSearchResult[]> {
  const queryStr = artist.trim() ? `${title.trim()} - ${artist.trim()}` : title.trim();
  if (!queryStr) return [];

  const queriesToTry = [queryStr];
  if (artist.trim() && title.trim()) queriesToTry.push(title.trim());

  for (const q of queriesToTry) {
    try {
      const url = `https://lrclib.net/api/search?q=${encodeURIComponent(q)}`;
      const res = await fetchWithTimeout(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) continue;

      const results: OnlineSearchResult[] = [];
      const seenKey = new Set<string>();

      for (const item of data) {
        let lyrics = item.plainLyrics || '';
        if (!lyrics && item.syncedLyrics) {
          lyrics = item.syncedLyrics.replace(/^\s*\[\d+:\d+(?:\.\d+)?\]\s*/gm, '');
        }

        if (lyrics && lyrics.trim()) {
          const itemTitle = item.trackName || item.name || title;
          const itemArtist = item.artistName || artist;
          const key = `${itemTitle.toLowerCase()}::${itemArtist.toLowerCase()}`;

          if (!seenKey.has(key)) {
            seenKey.add(key);
            results.push({ title: itemTitle, artist: itemArtist, lyrics: lyrics.trim(), source: 'LRCLIB.net', stage: 1 });
          }
        }
      }

      if (results.length > 0) return results;
    } catch {
      // try next query
    }
  }

  return [];
}

async function searchItunes(title: string, artist: string): Promise<{ title: string; artist: string }[]> {
  try {
    const q = artist.trim() ? `${title} ${artist}` : title;
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=5`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) return [];
    return data.results
      .filter((item: any) => item.trackName)
      .map((item: any) => ({ title: item.trackName || title, artist: item.artistName || artist }));
  } catch {
    return [];
  }
}

// STAGE 2: iTunes metadata candidates + lyrics.ovh
async function searchStage2Ovh(title: string, artist: string): Promise<OnlineSearchResult[]> {
  const candidates = await searchItunes(title, artist);
  const targets = candidates.length > 0 ? candidates : [{ title, artist }];

  const results: OnlineSearchResult[] = [];
  const seenKey = new Set<string>();

  for (const target of targets) {
    if (!target.artist.trim() || !target.title.trim()) continue;
    const key = `${target.title.toLowerCase()}::${target.artist.toLowerCase()}`;
    if (seenKey.has(key)) continue;
    seenKey.add(key);

    try {
      const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(target.artist)}/${encodeURIComponent(target.title)}`;
      const res = await fetchWithTimeout(url);
      if (res.ok) {
        const data = await res.json();
        if (data.lyrics && data.lyrics.trim()) {
          results.push({ title: target.title, artist: target.artist, lyrics: data.lyrics.trim(), source: 'lyrics.ovh', stage: 2 });
        }
      }
    } catch {
      // continue
    }
  }

  return results;
}

export async function searchByStage(title: string, artist: string, stage: number): Promise<StageSearchResult> {
  if (stage === 1) {
    const results = await searchStage1Lrclib(title, artist);
    return { results, currentStage: 1, nextStage: 2, sourceName: 'LRCLIB.net' };
  }

  if (stage === 2) {
    const results = await searchStage2Ovh(title, artist);
    return { results, currentStage: 2, nextStage: null, sourceName: 'iTunes / lyrics.ovh' };
  }

  return { results: [], currentStage: stage, nextStage: null, sourceName: 'Desconocido' };
}

// Cascading search: stage 1, fall back to stage 2 if empty.
export async function searchOnlineHybrid(title: string, artist: string): Promise<StageSearchResult> {
  const stage1 = await searchByStage(title, artist, 1);
  if (stage1.results.length > 0) return stage1;
  return searchByStage(title, artist, 2);
}
