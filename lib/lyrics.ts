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
