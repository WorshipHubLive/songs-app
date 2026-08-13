import { Stack } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function ServiceStackLayout() {
  const { theme } = useAppTheme();
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.background },
        headerTransparent: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: 'transparent' },
        headerTintColor: theme.primary,
        headerTitleStyle: { color: theme.foreground },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
