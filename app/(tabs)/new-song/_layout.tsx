import { Stack } from 'expo-router';

// Nested stack so Settings' sub-pages (Appearance, Language, ...) push on
// top while the bottom tab bar stays visible — unlike song/[id] and
// song/new, which are "focused screens" that hide it entirely. Headers
// are native now (Stack.Title inside each screen) instead of the custom
// BackHeader component.
export default function NewSowngLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
