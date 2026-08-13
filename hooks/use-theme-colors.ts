import { useCSSVariable } from 'uniwind';

// lucide-react-native icons render raw SVG (react-native-svg), not a
// View/Text uniwind can intercept `className` on — they need an actual
// color string. This reads the *live* value of our CSS color tokens
// (see global.css) so icon colors stay in sync with the active theme
// without duplicating the palette in JS.
export function useThemeColors() {
  const [
    background,
    foreground,
    card,
    mutedForeground,
    primary,
    primaryForeground,
    secondary,
    accent,
    destructive,
    border,
  ] = useCSSVariable([
    '--color-background',
    '--color-foreground',
    '--color-card',
    '--color-muted-foreground',
    '--color-primary',
    '--color-primary-foreground',
    '--color-secondary',
    '--color-accent',
    '--color-destructive',
    '--color-border',
  ]);

  return {
    background: String(background),
    foreground: String(foreground),
    card: String(card),
    mutedForeground: String(mutedForeground),
    primary: String(primary),
    primaryForeground: String(primaryForeground),
    secondary: String(secondary),
    accent: String(accent),
    destructive: String(destructive),
    border: String(border),
  };
}
