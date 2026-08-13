import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Music, CalendarCheck, Settings as SettingsIcon } from 'lucide-react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fonts } from '@/constants/theme';

// Mirrors MobileNav in the web app's App.tsx: fixed bottom bar, 3 items
// (Songs/Service/Settings), uppercase bold 10px labels, active = primary.
export default function TabLayout() {
  const { theme, isDark } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.mutedForeground,
        tabBarStyle: {
          backgroundColor: isDark ? 'rgba(6,8,15,0.95)' : 'rgba(246,248,250,0.95)',
          borderTopColor: theme.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 68,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: fonts.headingSemibold,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Songs',
          tabBarIcon: ({ color, size }) => <Music color={color} size={size ?? 22} strokeWidth={2.25} />,
        }}
      />
      <Tabs.Screen
        name="service"
        options={{
          title: 'Service',
          tabBarIcon: ({ color, size }) => <CalendarCheck color={color} size={size ?? 22} strokeWidth={2.25} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size ?? 22} strokeWidth={2.25} />,
        }}
      />
    </Tabs>
  );
}
