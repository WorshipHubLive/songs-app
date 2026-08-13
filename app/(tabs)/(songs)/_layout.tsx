import { useThemeColors } from '@/hooks/use-theme-colors';
import { Stack } from 'expo-router';

export default function SongsStackLayout() {
  const colors = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: 'transparent' },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.foreground },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
