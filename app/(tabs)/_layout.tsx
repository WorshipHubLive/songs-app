import { useAppTheme } from '@/hooks/useAppTheme';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

// Mirrors MobileNav (Songs/Service/Settings) but as a truly native tab
// bar — SwiftUI TabView on iOS (liquid glass automatically on iOS 26+),
// Material 3 bottom navigation on Android — instead of a JS-drawn bar.
export default function TabLayout() {
  const { theme } = useAppTheme();

  return (
    <NativeTabs tintColor={theme.primary} minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="(songs)">
        <NativeTabs.Trigger.Icon sf="music.note.list" md="library_music" />
        <NativeTabs.Trigger.Label>Songs</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(service)">
        <NativeTabs.Trigger.Icon sf="calendar.badge.checkmark" md="event_available" />
        <NativeTabs.Trigger.Label>Service</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon sf="gearshape.fill" md="settings" />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="new-song" role='search'>
        <NativeTabs.Trigger.Icon sf="plus"  />
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
