import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Music2, FileText } from 'lucide-react-native';
import { AmbientGlow } from '@/components/AmbientGlow';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fonts, radius, spacing } from '@/constants/theme';
import { mockSongs } from '@/constants/mockSongs';

// Mirrors SongDetails.tsx: native Stack header (back button comes free)
// with print/translate/edit/delete as a native Stack.Toolbar; centered
// segmented Lyrics/Chords tab; large bold lyric text body.
export default function SongDetailsScreen() {
  const { theme, isDark } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tab, setTab] = useState<'lyrics' | 'chords'>('lyrics');

  const song = mockSongs.find((s) => String(s.id) === id) ?? mockSongs[0];
  const lyrics = `${song.snippet}\n\n${song.snippet}\n\nCoro:\n${song.snippet}`;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <AmbientGlow />

      <Stack.Title>{song.title}</Stack.Title>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="printer" onPress={() => {}} />
        <Stack.Toolbar.Button icon="character.bubble" onPress={() => {}} />
        <Stack.Toolbar.Button icon="pencil" onPress={() => {}} />
        <Stack.Toolbar.Button icon="trash" tintColor={theme.destructive} onPress={() => {}} />
      </Stack.Toolbar>

      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={[styles.artist, { color: theme.mutedForeground }]}>{song.artist}</Text>

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

        <View style={{ paddingHorizontal: spacing.xl }}>
          {tab === 'lyrics' ? (
            <Text style={[styles.lyrics, { color: theme.foreground }]}>{lyrics}</Text>
          ) : (
            <View style={[styles.chordsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.chordsPlaceholder, { color: theme.mutedForeground }]}>
                Am{'    '}F{'    '}C{'    '}G{'\n\n'}Vista de acordes (ChordPro)
              </Text>
            </View>
          )}
        </View>
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
  artist: {
    fontSize: 12,
    fontFamily: fonts.body,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  tabRow: { alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.lg },
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
