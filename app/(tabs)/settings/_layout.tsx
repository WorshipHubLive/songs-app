import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';

// Nested stack so Settings' sub-pages (Appearance, Language) push on top
// while the bottom tab bar stays visible — unlike [songId] and
// new-song, which are "focused screens" that hide it entirely.
export default function SettingsLayout() {
  const colors = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerTransparent: Platform.OS === 'ios',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.foreground },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="language" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="search" />
      <Stack.Screen name="worshiphub" />
      <Stack.Screen name="local-sync" />
      <Stack.Screen name="cloud-sync" />
    </Stack>
  );
}
