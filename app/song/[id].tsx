import { AmbientGlow } from '@/components/AmbientGlow';
import { mockSongs } from '@/constants/mockSongs';
import { fonts, radius, spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import SegmentedControl from '@expo/ui/community/segmented-control';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Music2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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

      <Stack.Screen.BackButton displayMode='minimal' />

      <Stack.Title asChild>
        <View style={{ width: "100%" }}>
          <Text style={{ color: "#fff", fontSize: 18 }}>Holly Forever</Text>
          <Text style={{ color: "#fff", fontSize: 10 }}>{song.artist}</Text>
        </View>
      </Stack.Title>
      {/* <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="printer" onPress={() => {}} />
        <Stack.Toolbar.Button icon="character.bubble" onPress={() => {}} />
        <Stack.Toolbar.Button icon="pencil" onPress={() => {}} />
        <Stack.Toolbar.Button icon="trash" tintColor={theme.destructive} onPress={() => {}} />
      </Stack.Toolbar> */}

      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu icon="ellipsis">
          <Stack.Toolbar.MenuAction
            icon="printer"
          >
            Print
          </Stack.Toolbar.MenuAction>

          <Stack.Toolbar.MenuAction
            icon="character.bubble"
          >
            Translate
          </Stack.Toolbar.MenuAction>

          <Stack.Toolbar.MenuAction
            icon="pencil"
          >
            Edit
          </Stack.Toolbar.MenuAction>

          <Stack.Toolbar.MenuAction
            icon="trash"
            destructive
          >
            Delete
          </Stack.Toolbar.MenuAction>

        </Stack.Toolbar.Menu>
      </Stack.Toolbar>

      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 40 }}>


        <View style={{ paddingHorizontal: spacing.xl, marginVertical: 20 }}>
          <SegmentedControl
            values={['Letra', 'Acordes']}
            selectedIndex={tab === 'lyrics' ? 0 : 1}
            onChange={event => {
              setTab(event.nativeEvent.selectedSegmentIndex === 0 ? 'lyrics' : 'chords');
            }}
          />
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
