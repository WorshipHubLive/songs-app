import { Uniwind, useUniwind } from 'uniwind';

// Thin wrapper around uniwind's own theme system. The web app only ever
// offers these two explicit themes from Settings > Appearance (no
// "system" option), so `setTheme` never passes uniwind's 'system' value.
export type AppThemeMode = 'light' | 'dark';

export function useAppTheme() {
  const { theme } = useUniwind();
  return {
    mode: theme as AppThemeMode,
    isDark: theme === 'dark',
    setMode: (mode: AppThemeMode) => Uniwind.setTheme(mode),
  };
}
