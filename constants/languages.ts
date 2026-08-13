export const LANGUAGES = [
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
] as const;

export function languageFlagLabel(value: string): string {
  const language = LANGUAGES.find((l) => l.value === value);
  return language ? `${language.flag} ${language.label}` : value;
}
