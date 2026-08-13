import { useThemeColors } from '@/hooks/use-theme-colors';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

// Nested stack so this screen gets a real native header (Stack.Title/
// Stack.Toolbar) even though it's a NativeTabs trigger's own content,
// not a pushed screen — see (tabs)/_layout.tsx for how the tab bar
// itself hides while this route is active.
export default function NewSongStackLayout() {
  const colors = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerTransparent: Platform.OS === 'ios',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.foreground },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
