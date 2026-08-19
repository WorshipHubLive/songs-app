// Splits song lyrics into slides on blank-line boundaries.
export function splitIntoSlides(lyrics: string): string[] {
  return lyrics
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function countWords(text: string): number {
  const matches = text.trim().match(/\S+/g);
  return matches ? matches.length : 0;
}

interface ResolvableSong {
  language: string;
  lyrics: string;
}

interface ResolvableTranslation {
  language: string;
  lyrics: string;
}

/** Flattens a song's saved Service Slides language choice (whole-song
 * default + per-slide overrides, see hooks/use-app-settings.tsx's
 * `service.languages`/`service.slideOverrides`) into a single
 * lyrics-shaped string — same "split each language, zip by stanza
 * index" convention the [songId]/slides.tsx preview uses, so what
 * actually lands in WorshipHub's running order matches the preview.
 * Ported from standalone/songs/src/lib/lyrics.ts for parity.
 *
 * Returns `null` when there's nothing to override (global language is
 * still the song's own base language and no slide has a per-slide pick)
 * — callers should treat that as "send the song unchanged". */
export function resolveServiceLyrics(
  song: ResolvableSong,
  translations: ResolvableTranslation[],
  globalLanguage: string,
  overrides: Record<number, string>
): string | null {
  if (globalLanguage === song.language && Object.keys(overrides).length === 0) return null;

  const slidesByLanguage: Record<string, string[]> = { [song.language]: splitIntoSlides(song.lyrics) };
  for (const tr of translations) slidesByLanguage[tr.language] = splitIntoSlides(tr.lyrics);

  const slideCount = Object.values(slidesByLanguage).reduce((max, s) => Math.max(max, s.length), 0);
  const lines: string[] = [];
  for (let i = 0; i < slideCount; i++) {
    const lang = overrides[i] ?? globalLanguage;
    lines.push(slidesByLanguage[lang]?.[i] ?? slidesByLanguage[song.language]?.[i] ?? '');
  }
  return lines.join('\n\n');
}
