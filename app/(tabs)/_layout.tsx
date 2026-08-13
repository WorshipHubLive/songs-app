import { useThemeColors } from '@/hooks/use-theme-colors';
import { usePathname } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

// Mirrors MobileNav (Songs/Service/Settings) but as a truly native tab
// bar — SwiftUI TabView on iOS (liquid glass automatically on iOS 26+),
// Material 3 bottom navigation on Android — instead of a JS-drawn bar.
export default function TabLayout() {
  const colors = useThemeColors();
  // "new-song" (the role="search" trigger) is meant to read as a
  // focused, full-screen editor rather than "one more tab" — hide the
  // bar entirely while it's active, same as [songId] hides it by living
  // outside the tab navigator. This does remount the tab navigator on
  // toggle (documented NativeTabs `hidden` behavior), which is fine here
  // since none of the tabs hold state worth preserving through it.
  const isOnNewSong = usePathname() === '/new-song';

  return (
    <NativeTabs hidden={isOnNewSong} tintColor={colors.primary} minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="(songs)">
        <NativeTabs.Trigger.Icon sf="music.note.list" md="library_music" />
        <NativeTabs.Trigger.Label>Songs</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="service">
        <NativeTabs.Trigger.Icon sf="calendar.badge.checkmark" md="event_available" />
        <NativeTabs.Trigger.Label>Service</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon sf="gearshape.fill" md="settings" />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="new-song" role="search">
        <NativeTabs.Trigger.Icon sf="plus" md="add" />
        <NativeTabs.Trigger.Label>Add</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
