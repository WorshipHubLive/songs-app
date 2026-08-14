export interface ChordToken {
  chord: string;
  word: string;
}

export interface ParsedChordProLine {
  isSectionMarker: boolean;
  sectionTitle?: string;
  hasChords: boolean;
  tokens: ChordToken[];
}

const SECTION_MARKER_REGEX =
  /^\[(intro|interludio|solo|puente|outro|coro|estrofa|verso|instrumental|bridge|chorus|verse|silencio|pre-coro|fin)\]/i;

// Parses a single ChordPro line (e.g. "[G]Amazing [D]grace" or "[Intro]")
// into chord/word tokens for rendering chords above their syllable.
export function parseChordProLine(line: string): ParsedChordProLine {
  const trimmed = line.trim();
  const sectionMatch = trimmed.match(SECTION_MARKER_REGEX);
  if (sectionMatch) {
    return { isSectionMarker: true, sectionTitle: sectionMatch[1].toUpperCase(), hasChords: false, tokens: [] };
  }

  const chordRegex = /\[([^\]]+)\]/g;
  const tokens: ChordToken[] = [];
  let lastIndex = 0;
  let hasChords = false;

  for (let match = chordRegex.exec(line); match !== null; match = chordRegex.exec(line)) {
    hasChords = true;
    const before = line.slice(lastIndex, match.index);
    if (tokens.length > 0) {
      tokens[tokens.length - 1].word += before;
    } else if (before.trim()) {
      tokens.push({ chord: '', word: before });
    }
    tokens.push({ chord: match[1], word: '' });
    lastIndex = match.index + match[0].length;
  }

  const tail = line.slice(lastIndex);
  if (tokens.length > 0 && tail) {
    tokens[tokens.length - 1].word += tail;
  } else if (tail.trim()) {
    tokens.push({ chord: '', word: tail });
  }

  if (tokens.length === 0 && line.trim()) {
    tokens.push({ chord: '', word: line });
  }

  return { isSectionMarker: false, hasChords, tokens };
}

export function parseChordPro(chordPro: string): ParsedChordProLine[] {
  return chordPro.split('\n').map(parseChordProLine);
}
