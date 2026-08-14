import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function SongsStackLayout() {
  const colors = useThemeColors();
  return (
    <Stack
      screenOptions={{
        // Transparent + blur reads great on iOS; on Android the header
        // has no automatic blur/scrim behind it, so "transparent" just
        // means content scrolls straight under an invisible bar — looks
        // broken. Android gets a plain solid header instead.
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
