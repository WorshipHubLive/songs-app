import { useAppTheme } from '@/hooks/useAppTheme';
import { Stack } from 'expo-router';

// Nested stack so Settings' sub-pages (Appearance, Language, ...) push on
// top while the bottom tab bar stays visible — unlike song/[id] and
// song/new, which are "focused screens" that hide it entirely. Headers
// are native now (Stack.Title inside each screen) instead of the custom
// BackHeader component.
export default function SettingsLayout() {
  const { theme } = useAppTheme();
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.background },
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: 'transparent' },
        headerStyle: { backgroundColor: 'transparent' },
        headerTintColor: theme.primary,
        headerTitleStyle: { color: theme.foreground },
        headerLargeTitleStyle: { color: theme.foreground },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="language" />
    </Stack>
  );
}
