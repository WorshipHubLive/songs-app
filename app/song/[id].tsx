import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Printer, Languages, Pencil, Trash2, Music2, FileText } from 'lucide-react-native';
import { AmbientGlow } from '@/components/AmbientGlow';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fonts, radius, spacing } from '@/constants/theme';
import { mockSongs } from '@/constants/mockSongs';

// Mirrors SongDetails.tsx: full-bleed focused screen, no tab bar. Top bar
// with back/print/translate/edit/delete; centered segmented Lyrics/Chords
// tab; large bold lyric text body.
export default function SongDetailsScreen() {
  const { theme, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tab, setTab] = useState<'lyrics' | 'chords'>('lyrics');

  const song = mockSongs.find((s) => String(s.id) === id) ?? mockSongs[0];
  const lyrics = `${song.snippet}\n\n${song.snippet}\n\nCoro:\n${song.snippet}`;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <AmbientGlow />

      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 10,
            backgroundColor: isDark ? 'rgba(6,8,15,0.8)' : 'rgba(246,248,250,0.8)',
            borderBottomColor: theme.border,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={[styles.iconButton, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <ArrowLeft size={17} color={theme.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.foreground }]} numberOfLines={1}>
            {song.title}
          </Text>
          <Text style={[styles.artist, { color: theme.mutedForeground }]} numberOfLines={1}>
            {song.artist}
          </Text>
        </View>
        <Pressable style={styles.smallIconButton}>
          <Printer size={16} color={theme.mutedForeground} />
        </Pressable>
        <Pressable style={styles.smallIconButton}>
          <Languages size={16} color={theme.mutedForeground} />
        </Pressable>
        <Pressable style={styles.smallIconButton}>
          <Pencil size={16} color={theme.mutedForeground} />
        </Pressable>
        <Pressable style={styles.smallIconButton}>
          <Trash2 size={16} color={theme.destructive} />
        </Pressable>
      </View>

      <View style={styles.tabRow}>
        <View style={[styles.segmented, { backgroundColor: theme.muted, borderColor: theme.border }]}>
          <SegButton
            active={tab === 'lyrics'}
            icon={FileText}
            label="Letra"
            onPress={() => setTab('lyrics')}
          />
          <SegButton
            active={tab === 'chords'}
            icon={Music2}
            label="Acordes"
            onPress={() => setTab('chords')}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + 40 }}>
        {tab === 'lyrics' ? (
          <Text style={[styles.lyrics, { color: theme.foreground }]}>{lyrics}</Text>
        ) : (
          <View style={[styles.chordsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.chordsPlaceholder, { color: theme.mutedForeground }]}>
              Am{'    '}F{'    '}C{'    '}G{'\n\n'}Vista de acordes (ChordPro)
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function SegButton({
  active,
  icon: Icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: typeof Music2;
  label: string;
  onPress: () => void;
}) {
  const { theme, isDark } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.segButton,
        active && { backgroundColor: isDark ? theme.card : '#ffffff' },
      ]}
    >
      <Icon size={13} color={active ? theme.primary : theme.mutedForeground} />
      <Text style={[styles.segLabel, { color: active ? theme.primary : theme.mutedForeground }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.lg,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallIconButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontFamily: fonts.headingSemibold },
  artist: { fontSize: 11, fontFamily: fonts.body, marginTop: 1 },
  tabRow: { alignItems: 'center', marginTop: spacing.md },
  segmented: {
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 3,
  },
  segButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.sm + 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  segLabel: { fontSize: 12, fontFamily: fonts.headingSemibold },
  lyrics: { fontSize: 17, fontFamily: fonts.heading, lineHeight: 28 },
  chordsCard: { borderRadius: radius.xl, borderWidth: 1, padding: spacing.xl },
  chordsPlaceholder: { fontSize: 14, fontFamily: 'monospace', lineHeight: 22 },
});
