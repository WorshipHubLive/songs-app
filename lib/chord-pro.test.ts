import { parseChordPro, parseChordProLine } from './chord-pro';

describe('parseChordProLine', () => {
  it('parses a plain lyric line with no chords', () => {
    const result = parseChordProLine('Amazing grace how sweet the sound');
    expect(result.isSectionMarker).toBe(false);
    expect(result.hasChords).toBe(false);
    expect(result.tokens).toEqual([{ chord: '', word: 'Amazing grace how sweet the sound' }]);
  });

  it('parses a line starting with a chord, folding the word into that chord token', () => {
    const result = parseChordProLine('[G]Amazing grace');
    expect(result.hasChords).toBe(true);
    expect(result.tokens).toEqual([{ chord: 'G', word: 'Amazing grace' }]);
  });

  it('parses a line with a chord in the middle', () => {
    const result = parseChordProLine('Amazing [D]grace how [G]sweet');
    expect(result.hasChords).toBe(true);
    expect(result.tokens).toEqual([
      { chord: '', word: 'Amazing ' },
      { chord: 'D', word: 'grace how ' },
      { chord: 'G', word: 'sweet' },
    ]);
  });

  it('parses back-to-back chords with no lyric between them', () => {
    const result = parseChordProLine('[G][D]');
    expect(result.tokens).toEqual([
      { chord: 'G', word: '' },
      { chord: 'D', word: '' },
    ]);
  });

  it('recognizes section markers and does not treat them as chords', () => {
    const result = parseChordProLine('[Coro]');
    expect(result.isSectionMarker).toBe(true);
    expect(result.sectionTitle).toBe('CORO');
    expect(result.hasChords).toBe(false);
    expect(result.tokens).toEqual([]);
  });

  it('recognizes English and Spanish section marker aliases case-insensitively', () => {
    expect(parseChordProLine('[VERSE]').sectionTitle).toBe('VERSE');
    expect(parseChordProLine('[estrofa]').sectionTitle).toBe('ESTROFA');
    expect(parseChordProLine('[Pre-Coro]').sectionTitle).toBe('PRE-CORO');
  });

  it('does not treat a chord-only line as a section marker unless it matches the known list', () => {
    const result = parseChordProLine('[G]');
    expect(result.isSectionMarker).toBe(false);
    expect(result.tokens).toEqual([{ chord: 'G', word: '' }]);
  });

  it('returns an empty token list for a blank line', () => {
    const result = parseChordProLine('');
    expect(result.tokens).toEqual([]);
    expect(result.hasChords).toBe(false);
  });

  it('returns an empty token list for a whitespace-only line', () => {
    const result = parseChordProLine('   ');
    expect(result.tokens).toEqual([]);
  });
});

describe('parseChordPro', () => {
  it('parses every line of a multi-line ChordPro block independently', () => {
    const block = '[Coro]\n[G]Amazing [D]grace\nHow sweet the sound';
    const lines = parseChordPro(block);
    expect(lines).toHaveLength(3);
    expect(lines[0].isSectionMarker).toBe(true);
    expect(lines[1].hasChords).toBe(true);
    expect(lines[2].tokens).toEqual([{ chord: '', word: 'How sweet the sound' }]);
  });
});
