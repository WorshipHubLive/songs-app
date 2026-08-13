// Design tokens ported 1:1 from standalone/songs' CSS custom properties
// ([data-theme='worshiphub-dark'] / [data-theme='worshiphub-light']) so
// this native rebuild matches the web app's colors exactly.

export const DarkTheme = {
  background: '#06080f',
  foreground: '#e1e2ed',
  card: '#1d1f27',
  cardForeground: '#e1e2ed',
  popover: '#272a32',
  popoverForeground: '#e1e2ed',
  primary: '#6edab4',
  primaryForeground: '#003829',
  primaryContainer: '#35a784',
  onPrimaryContainer: '#ffffff',
  secondary: '#44e2cd',
  secondaryForeground: '#003731',
  muted: '#191b23',
  mutedForeground: '#bfc7d1',
  accent: '#8ecdff',
  accentForeground: '#00344f',
  destructive: '#ffb4ab',
  border: '#40484f',
  input: '#40484f',
  ring: '#6edab4',
  // Settings theme-swatch preview metadata.
  swatchBg: '#11131b',
  swatchBorder: '#40484f',
  swatchDot: '#8ecdff',
  // Ambient background glow radials.
  glow1: 'rgba(110,218,180,0.08)',
  glow2: 'rgba(69,156,214,0.08)',
};

export const LightTheme = {
  background: '#f6f8fa',
  foreground: '#0f172a',
  card: '#ffffff',
  cardForeground: '#0f172a',
  popover: '#ffffff',
  popoverForeground: '#0f172a',
  primary: '#35a784',
  primaryForeground: '#ffffff',
  primaryContainer: '#35a784',
  onPrimaryContainer: '#ffffff',
  secondary: '#0d9488',
  secondaryForeground: '#ffffff',
  muted: '#f1f5f9',
  mutedForeground: '#64748b',
  accent: '#0284c7',
  accentForeground: '#ffffff',
  destructive: '#ef4444',
  border: '#e2e8f0',
  input: '#cbd5e1',
  ring: '#35a784',
  swatchBg: '#f6f8fa',
  swatchBorder: '#e2e8f0',
  swatchDot: '#35a784',
  glow1: 'rgba(53,167,132,0.08)',
  glow2: 'rgba(2,132,199,0.08)',
};

export type ThemeTokens = typeof DarkTheme;

// Card accent-border cycle (SongCard's `song.id % 3`) — 3 tints a card can
// take, dark-mode values; light mode reuses primary/secondary/accent too.
export function cardAccent(theme: ThemeTokens, index: number) {
  const accents = [theme.primary, theme.secondary, theme.accent];
  return accents[index % 3];
}

export const radius = {
  sm: 4,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  full: 9999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
};

export const fonts = {
  heading: 'Sora_700Bold',
  headingSemibold: 'Sora_600SemiBold',
  body: 'Sora_400Regular',
};
