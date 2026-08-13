import { AmbientGlow } from '@/components/ambient-glow';
import { ChordProPreview } from '@/components/chord-pro-preview';
import { DeleteSongModal } from '@/components/delete-song-modal';
import { deleteSong, songByIdQuery } from '@/db/songs-repository';
import ArrowBackIcon from '@expo/material-symbols/arrow_back.xml';
import DeleteIcon from '@expo/material-symbols/delete.xml';
import EditIcon from '@expo/material-symbols/edit.xml';
import MoreVertIcon from '@expo/material-symbols/more_vert.xml';
import PrintIcon from '@expo/material-symbols/print.xml';
import TranslateIcon from '@expo/material-symbols/translate.xml';
import SegmentedControl from '@expo/ui/community/segmented-control';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';


// Mirrors SongDetails.tsx: native Stack header (back button comes free)
// with print/translate/edit/delete grouped in a Stack.Toolbar menu;
// segmented Lyrics/Chords tab; large bold lyric text body.
export default function SongDetailsScreen() {
  const { songId: songIdParam } = useLocalSearchParams<{ songId: string }>();
  const router = useRouter();
  const songId = Number(songIdParam);
  const [tab, setTab] = useState<'lyrics' | 'chords'>('lyrics');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data } = useLiveQuery(songByIdQuery(songId));
  const song = data?.[0];

  const handleDelete = async () => {
    if (!song) return;
    setDeleting(true);
    try {
      await deleteSong(song.id);
      router.back();
    } finally {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  if (!song) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <AmbientGlow />
        <Text className="font-sora text-sm text-muted-foreground">Canción no encontrada.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <AmbientGlow />

       <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon={Platform.OS === 'ios' ? 'chevron.backward' : ArrowBackIcon} onPress={() => router.back()} />
      </Stack.Toolbar>

      <Stack.Title asChild>
        <View className="w-full">
          <Text className="font-sora-semibold text-lg text-foreground" numberOfLines={1}>{song.title}</Text>
          <Text className="font-sora text-[10px] text-muted-foreground">{song.artist}</Text>
        </View>
      </Stack.Title>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu icon={Platform.OS === 'ios' ? 'ellipsis' : MoreVertIcon}>
          <Stack.Toolbar.MenuAction icon={Platform.OS === 'ios' ? 'printer' : PrintIcon}>Print</Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            icon={Platform.OS === 'ios' ? 'character.bubble' : TranslateIcon}
            onPress={() => router.push(`/${song.id}/translate`)}
          >
            Traducir
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            icon={Platform.OS === 'ios' ? 'pencil' : EditIcon}
            onPress={() => router.push(`/${song.id}/edit`)}
          >
            Editar
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            icon={Platform.OS === 'ios' ? 'trash' : DeleteIcon}
            destructive
            onPress={() => setConfirmingDelete(true)}
          >
            Eliminar
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
            <Text className="font-sora-bold text-[17px] leading-7 text-foreground">
              {song.lyrics || 'Sin letra todavía.'}
            </Text>
          ) : (
            <View className="rounded-xl border border-border bg-card p-6">
              <ChordProPreview chordPro={song.chords} />
            </View>
          )}
        </View>
      </ScrollView>

      <DeleteSongModal
        song={confirmingDelete ? song : null}
        deleting={deleting}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={handleDelete}
      />
    </View>
  );
}
