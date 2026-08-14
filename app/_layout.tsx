import '@/global.css';
import { Sora_400Regular, Sora_600SemiBold, Sora_700Bold, Sora_800ExtraBold, useFonts } from '@expo-google-fonts/sora';
import { DarkTheme as NavDark, ThemeProvider as NavigationThemeProvider, DefaultTheme as NavLight, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AppSettingsProvider } from '@/hooks/use-app-settings';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useLocalSyncServer } from '@/hooks/use-local-sync-server';
import { useThemeColors } from '@/hooks/use-theme-colors';

export { ErrorBoundary } from 'expo-router';

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
    <AppSettingsProvider>
      <RootLayoutNav />
    </AppSettingsProvider>
  );
}

function RootLayoutNav() {
  const { isDark } = useAppTheme();
  const colors = useThemeColors();
  // Runs for the whole life of the app, same as the desktop's own
  // always-on microserver — see hooks/use-local-sync-server.ts.
  useLocalSyncServer();

  // Reuses expo-router's nav theme plumbing but with WorshipHub Songs'
  // own tokens, so the native screen-transition background/tab bar
  // never flashes RN's default black/white between routes.
  const navTheme = {
    ...(isDark ? NavDark : NavLight),
    colors: {
      ...(isDark ? NavDark.colors : NavLight.colors),
      background: colors.background,
      card: colors.card,
      text: colors.foreground,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    // Required by react-native-gesture-handler — Swipeable (Android's
    // song-list.android.tsx) silently does nothing without it.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationThemeProvider value={navTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background } }}>
          {/* NativeTabs renders its own chrome — no Stack header at this level. */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="[songId]" options={{ headerShown: false }} />
        </Stack>
      </NavigationThemeProvider>
    </GestureHandlerRootView>
  );
}
