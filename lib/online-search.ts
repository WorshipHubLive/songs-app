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

        if (lyrics?.trim()) {
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
    const data = (await res.json()) as { results?: { trackName?: string; artistName?: string }[] };
    if (!data.results || !Array.isArray(data.results)) return [];
    return data.results
      .filter((item) => item.trackName)
      .map((item) => ({ title: item.trackName || title, artist: item.artistName || artist }));
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
        if (data.lyrics?.trim()) {
          results.push({
            title: target.title,
            artist: target.artist,
            lyrics: data.lyrics.trim(),
            source: 'lyrics.ovh',
            stage: 2,
          });
        }
      }
    } catch {
      // continue
    }
  }

  return results;
}

const FOOTER_MARKERS = [
  'written by',
  'escrito por',
  'compositores',
  'composición:',
  'sent by',
  'enviado por',
  'revised by',
  'revisado por',
  'did you see an error',
  'viste un error',
  'datos están equivocados',
  'envío por',
  'educación musical',
  'hecho con amor',
  'derechos reservados',
  'el mayor sitio web',
  '1 millón de canciones',
  '78 millones de personas',
  '## album',
  '## credits',
  '## comentarios',
  '## comments',
  '## join',
  'most played from',
  'más escuchadas',
  'share questions',
  'discover letras',
  'letras academy',
  'practice this content',
  'support center',
];

function cleanRawWebLyrics(text: string): string {
  let cleaned = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '');

  const lower = cleaned.toLowerCase();
  let cutIndex = cleaned.length;
  for (const marker of FOOTER_MARKERS) {
    const idx = lower.indexOf(marker);
    if (idx !== -1 && idx < cutIndex) cutIndex = idx;
  }
  cleaned = cleaned.slice(0, cutIndex);

  const rawLines = cleaned.split('\n');
  const bodyLines: string[] = [];
  let lyricsStarted = false;

  for (let line of rawLines) {
    line = line.trim();
    if (!line) {
      if (lyricsStarted) bodyLines.push('');
      continue;
    }
    if (/^!?\[.*?\]\(.*?\)$/.test(line) || /^\[##\s+.*?\]/.test(line)) continue;
    if (/^#{1,6}\s+/.test(line)) continue;
    if (
      /^(lyrics\s+views|subscribe|views\s+\d+|album\s+•|\d+\s*\/\s*\d+)/i.test(line) ||
      /^(tono|afinación|estándar|capo|sin capo|diagramas|mostrar|tablaturas|rasgueos|afinador|metrónomo|medios|composición|auto scroll|imprimir|simplificar|corregir|cifra|favoritar|datos están equivocados|envío por|hecho con|derechos reservados|©)/i.test(
        line
      ) ||
      /^\[.*?(lyrics|translation|meaning|acordes|cifra).*?\]/i.test(line)
    ) {
      continue;
    }

    line = line.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
    if (line) {
      lyricsStarted = true;
      bodyLines.push(line);
    }
  }

  return bodyLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// STAGE 3: Tavily web search — advanced full-page extraction, only runs
// with a user-supplied API key (see settings/search.tsx). Free-tier
// LRCLIB/lyrics.ovh cover most cases; this is the fallback for the rest.
async function searchStage3Tavily(title: string, artist: string, tavilyApiKey: string): Promise<OnlineSearchResult[]> {
  if (!tavilyApiKey.trim()) return [];
  try {
    const query = `letra completa "${title}" ${artist}`.trim();
    const res = await fetchWithTimeout('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: tavilyApiKey.trim(),
        query,
        search_depth: 'advanced',
        include_raw_content: true,
        max_results: 5,
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.results || [];

    let bestRawText = '';
    let bestTitle = title;

    for (const r of items) {
      const rawText = r.raw_content && r.raw_content.trim().length > 150 ? r.raw_content.trim() : (r.content || '').trim();
      if (rawText.length > bestRawText.length) {
        bestRawText = rawText;
        if (r.title && r.title.length < 80) {
          bestTitle = r.title.split('-')[0].trim() || title;
        }
      }
    }

    if (bestRawText.length > 80) {
      const cleaned = cleanRawWebLyrics(bestRawText);
      return [{ title: bestTitle, artist, lyrics: cleaned.slice(0, 6000), source: 'Tavily Web Search', stage: 3 }];
    }
    return [];
  } catch {
    return [];
  }
}

export async function searchByStage(
  title: string,
  artist: string,
  stage: number,
  tavilyApiKey: string = ''
): Promise<StageSearchResult> {
  if (stage === 1) {
    const results = await searchStage1Lrclib(title, artist);
    return { results, currentStage: 1, nextStage: 2, sourceName: 'LRCLIB.net' };
  }

  if (stage === 2) {
    const results = await searchStage2Ovh(title, artist);
    return { results, currentStage: 2, nextStage: tavilyApiKey.trim() ? 3 : null, sourceName: 'iTunes / lyrics.ovh' };
  }

  if (stage === 3) {
    const results = await searchStage3Tavily(title, artist, tavilyApiKey);
    return { results, currentStage: 3, nextStage: null, sourceName: 'Tavily Web Search' };
  }

  return { results: [], currentStage: stage, nextStage: null, sourceName: 'Desconocido' };
}

// Cascading search: stage 1 → stage 2 → stage 3 (only if a Tavily key is
// configured), stopping at the first stage that finds anything.
export async function searchOnlineHybrid(title: string, artist: string, tavilyApiKey: string = ''): Promise<StageSearchResult> {
  const stage1 = await searchByStage(title, artist, 1, tavilyApiKey);
  if (stage1.results.length > 0) return stage1;

  const stage2 = await searchByStage(title, artist, 2, tavilyApiKey);
  if (stage2.results.length > 0 || !tavilyApiKey.trim()) return stage2;

  return searchByStage(title, artist, 3, tavilyApiKey);
}
