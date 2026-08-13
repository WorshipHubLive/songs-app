import { AmbientGlow } from '@/components/ambient-glow';
import { mockSongs } from '@/constants/mock-songs';
import SegmentedControl from '@expo/ui/community/segmented-control';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

// Mirrors SongDetails.tsx: native Stack header (back button comes free)
// with print/translate/edit/delete grouped in a Stack.Toolbar menu;
// segmented Lyrics/Chords tab; large bold lyric text body.
export default function SongDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tab, setTab] = useState<'lyrics' | 'chords'>('lyrics');

  const song = mockSongs.find((s) => String(s.id) === id) ?? mockSongs[0];
  const lyrics = `${song.snippet}\n\n${song.snippet}\n\nCoro:\n${song.snippet}`;

  return (
    <View className="flex-1 bg-background">
      <AmbientGlow />

      <Stack.Screen.BackButton displayMode="minimal" />
      <Stack.Title asChild>
        <View className="w-full items-center">
          <Text className="font-sora-semibold text-lg text-foreground">{song.title}</Text>
          <Text className="font-sora text-[10px] text-muted-foreground">{song.artist}</Text>
        </View>
      </Stack.Title>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu icon="ellipsis">
          <Stack.Toolbar.MenuAction icon="printer">Print</Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction icon="character.bubble">Translate</Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction icon="pencil">Edit</Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction icon="trash" destructive>
            Delete
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>

      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerClassName="pb-10">
        <View className="mx-5 my-5">
          <SegmentedControl
            values={['Letra', 'Acordes']}
            selectedIndex={tab === 'lyrics' ? 0 : 1}
            onChange={(event) => setTab(event.nativeEvent.selectedSegmentIndex === 0 ? 'lyrics' : 'chords')}
          />
        </View>

        <View className="px-6">
          {tab === 'lyrics' ? (
            <Text className="font-sora-bold text-[17px] leading-7 text-foreground">{lyrics}</Text>
          ) : (
            <View className="rounded-xl border border-border bg-card p-6">
              <Text className="font-mono text-sm leading-[22px] text-muted-foreground">
                Am{'    '}F{'    '}C{'    '}G{'\n\n'}Vista de acordes (ChordPro)
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
