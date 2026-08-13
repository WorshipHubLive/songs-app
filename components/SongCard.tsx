import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Globe, CalendarPlus, CalendarCheck, Pencil, Languages, Trash2 } from 'lucide-react-native';
import { GlassCard } from '@/components/GlassCard';
import { useAppTheme } from '@/hooks/useAppTheme';
import { cardAccent, fonts, radius, spacing } from '@/constants/theme';
import type { MockSong } from '@/constants/mockSongs';

// Mirrors SongCard.tsx: colored left-border cycling primary/secondary/
// accent by `id % 3`, glowing tinted orb top-right, language badge,
// title/artist/lyric-snippet, and a footer icon-button row.
export function SongCard({
  song,
  onPress,
  onToggleService,
}: {
  song: MockSong;
  onPress?: () => void;
  onToggleService?: () => void;
}) {
  const { theme } = useAppTheme();
  const accent = cardAccent(theme, song.id);

  return (
    <Pressable onPress={onPress}>
      <GlassCard accentColor={accent} style={styles.card}>
        <View pointerEvents="none" style={[styles.orb, { backgroundColor: accent }]} />

        {song.languages > 1 && (
          <View style={[styles.badge, { borderColor: theme.secondary }]}>
            <Globe size={11} color={theme.secondary} strokeWidth={2.5} />
            <Text style={[styles.badgeText, { color: theme.secondary }]}>
              {song.languages} idiomas
            </Text>
          </View>
        )}

        <Text style={[styles.title, { color: theme.foreground }]} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={[styles.artist, { color: accent }]} numberOfLines={1}>
          {song.artist}
        </Text>
        <Text style={[styles.snippet, { color: theme.mutedForeground }]} numberOfLines={3}>
          {song.snippet}
        </Text>

        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <IconButton icon={Languages} color={theme.mutedForeground} />
            <IconButton icon={Pencil} color={theme.mutedForeground} />
            <IconButton
              icon={song.inService ? CalendarCheck : CalendarPlus}
              color={song.inService ? theme.primary : theme.mutedForeground}
              onPress={onToggleService}
            />
          </View>
          <IconButton icon={Trash2} color={theme.destructive} tintBg={`${theme.destructive}1A`} />
        </View>
      </GlassCard>
    </Pressable>
  );
}

function IconButton({
  icon: Icon,
  color,
  tintBg,
  onPress,
}: {
  icon: typeof Globe;
  color: string;
  tintBg?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.iconButton, tintBg ? { backgroundColor: tintBg } : null]}
    >
      <Icon size={15} color={color} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    gap: spacing.sm,
  },
  orb: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    opacity: 0.18,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 2,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: fonts.headingSemibold,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.headingSemibold,
  },
  artist: {
    fontSize: 13,
    fontFamily: fonts.body,
  },
  snippet: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  footerLeft: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: radius.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
