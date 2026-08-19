import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';

// Nested stack so the detail screen and its Edit/Translate sub-screens
// (pushed on top, tab bar stays visible) all share one native header
// config — mirrors settings/_layout.tsx.
export default function SongLayout() {
  const _colors = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerTransparent: Platform.OS === 'ios',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="translate" />
      <Stack.Screen name="slides" />
    </Stack>
  );
}
