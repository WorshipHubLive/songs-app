import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fonts, radius, spacing } from '@/constants/theme';
import type { LucideIcon } from 'lucide-react-native';

// Mirrors `.glass-button` settings rows: icon left, title+desc, chevron
// right. Used for full-width rows (Profile, Appearance, Idioma, WorshipHub).
export function SettingsRow({
  icon: Icon,
  title,
  description,
  onPress,
  trailing,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
}) {
  const { theme, isDark } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.row,
        {
          backgroundColor: isDark ? 'rgba(25,27,35,0.6)' : 'rgba(255,255,255,0.9)',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.muted }]}>
        <Icon size={16} color={theme.foreground} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: theme.foreground }]}>{title}</Text>
        {description ? (
          <Text style={[styles.desc, { color: theme.mutedForeground }]} numberOfLines={1}>
            {description}
          </Text>
        ) : null}
      </View>
      {trailing ?? <ChevronRight size={16} color={theme.mutedForeground} />}
    </Pressable>
  );
}

// Icon-over-label style used for the 2-col Local Sync / Cloud Sync grid.
export function SettingsTile({
  icon: Icon,
  title,
  onPress,
}: {
  icon: LucideIcon;
  title: string;
  onPress?: () => void;
}) {
  const { theme, isDark } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tile,
        {
          backgroundColor: isDark ? 'rgba(25,27,35,0.6)' : 'rgba(255,255,255,0.9)',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        },
      ]}
    >
      <Icon size={20} color={theme.foreground} strokeWidth={1.75} />
      <Text style={[styles.tileTitle, { color: theme.foreground }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 14, fontFamily: fonts.headingSemibold },
  desc: { fontSize: 11, fontFamily: fonts.body, marginTop: 1 },
  tile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 18,
  },
  tileTitle: { fontSize: 12, fontFamily: fonts.headingSemibold },
});
