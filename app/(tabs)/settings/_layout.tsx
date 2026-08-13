import { Stack } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';

// Nested stack so Settings' sub-pages (Appearance, Language, ...) push on
// top while the bottom tab bar stays visible — unlike song/[id] and
// song/new, which are "focused screens" that hide it entirely.
export default function SettingsLayout() {
  const { theme } = useAppTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="language" />
    </Stack>
  );
}
