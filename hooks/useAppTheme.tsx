import React, { createContext, useContext, useMemo, useState } from 'react';
import { DarkTheme, LightTheme, ThemeTokens } from '@/constants/theme';

type ThemeMode = 'worshiphub-dark' | 'worshiphub-light';

type AppThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  theme: ThemeTokens;
  isDark: boolean;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

// The web app defaults to the dark theme (`:root` == worshiphub-dark) and
// only ever offers these two explicit themes from Settings > Appearance —
// no "system" option — so this mirrors that instead of following the OS
// color scheme.
export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('worshiphub-dark');

  const value = useMemo<AppThemeContextValue>(() => {
    const isDark = mode === 'worshiphub-dark';
    return { mode, setMode, theme: isDark ? DarkTheme : LightTheme, isDark };
  }, [mode]);

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(AppThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within AppThemeProvider');
  return ctx;
}
