import '@/global.css';
import {
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/sora';
import { DarkTheme as NavDark, ThemeProvider as NavigationThemeProvider, DefaultTheme as NavLight, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AppThemeProvider, useAppTheme } from '@/hooks/useAppTheme';

export {
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Sora_400Regular,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppThemeProvider>
      <RootLayoutNav />
    </AppThemeProvider>
  );
}

function RootLayoutNav() {
  const { theme, isDark } = useAppTheme();

  // Reuses expo-router's nav theme plumbing but with WorshipHub Songs'
  // own tokens, so the native screen-transition background/tab bar
  // never flashes RN's default black/white between routes.
  const navTheme = {
    ...(isDark ? NavDark : NavLight),
    colors: {
      ...(isDark ? NavDark.colors : NavLight.colors),
      background: theme.background,
      card: theme.card,
      text: theme.foreground,
      border: theme.border,
      primary: theme.primary,
    },
  };

  return (
    <NavigationThemeProvider value={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ contentStyle: { backgroundColor: theme.background } }}>
        {/* NativeTabs renders its own chrome — no Stack header at this level. */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="song/[id]" options={{ presentation: 'card' }} />
      </Stack>
    </NavigationThemeProvider>
  );
}
