import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function ServiceStackLayout() {
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
