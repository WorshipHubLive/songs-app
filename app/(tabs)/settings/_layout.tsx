import { useThemeColors } from '@/hooks/use-theme-colors';
import { Stack } from 'expo-router';

// Nested stack so Settings' sub-pages (Appearance, Language) push on top
// while the bottom tab bar stays visible — unlike song/[id] and
// new-song, which are "focused screens" that hide it entirely.
export default function SettingsLayout() {
  const colors = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: 'transparent' },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.foreground },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="language" />
    </Stack>
  );
}
