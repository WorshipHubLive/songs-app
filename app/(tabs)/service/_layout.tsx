import { useAppTheme } from '@/hooks/useAppTheme';
import { Stack } from 'expo-router';

export default function ServiceStackLayout() {
  const { theme } = useAppTheme();
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
