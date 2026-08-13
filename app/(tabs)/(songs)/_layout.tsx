import { Stack } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function SongsStackLayout() {
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
        headerLargeTitle: true,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
