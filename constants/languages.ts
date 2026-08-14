// Same 9 languages as Settings' Language picker (see
// app/(tabs)/settings/language.tsx) — this is the song's own content
// language (lyrics/chords), not the app's interface language, but the
// two lists are kept in sync so a lyric written in any language the UI
// itself supports can be tagged correctly.
export const LANGUAGES = [
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'ht', label: 'Kreyòl Ayisyen', flag: '🇭🇹' },
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
  { value: 'pl', label: 'Polski', flag: '🇵🇱' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
] as const;

export function languageFlagLabel(value: string): string {
  const language = LANGUAGES.find((l) => l.value === value);
  return language ? `${language.flag} ${language.label}` : value;
}
