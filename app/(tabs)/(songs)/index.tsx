import { AmbientGlow } from '@/components/ambient-glow';
import { DeleteSongModal } from '@/components/delete-song-modal';
import { SongList } from '@/components/song-list';
import type { Song } from '@/db/schema';
import { allSongsQuery, deleteSong, setInService } from '@/db/songs-repository';
import SyncIcon from '@expo/material-symbols/sync.xml';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Text, View } from 'react-native';

// Mirrors Library.tsx. The top bar (title, search, sync) is the real
// native header — Stack.Title (asChild, so it's a plain styled Text
// instead of the iOS large-title look) for the title, Stack.SearchBar
// for the native search field, Stack.Toolbar for the sync action.
// There's no custom-drawn top bar or floating "+" button — those aren't
// native iOS patterns; "Add" lives as its own search-role tab instead
// (see (tabs)/_layout.tsx).
export default function LibraryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Song | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: allSongs } = useLiveQuery(allSongsQuery());
  const songs = (allSongs ?? []).filter((s) => `${s.title} ${s.artist}`.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSong(deleteTarget.id);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <AmbientGlow />

      <Stack.Title asChild>
        <Text className="font-sora-bold text-xl text-foreground">Songs</Text>
      </Stack.Title>
      <Stack.SearchBar
        placeholder="Buscar canciones..."
        onChangeText={(e) => setSearch(e.nativeEvent.text)}
        onCancelButtonPress={() => setSearch('')}
        obscureBackground={false}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon={Platform.OS === 'ios' ? 'arrow.triangle.2.circlepath' : SyncIcon} onPress={() => {}} />
      </Stack.Toolbar>

      <SongList
        songs={songs}
        onPressSong={(song) => router.push(`/${song.id}`)}
        onToggleService={(song) => setInService(song.id, !song.inService)}
        onTranslate={(song) => router.push(`/${song.id}/translate`)}
        onEdit={(song) => router.push(`/${song.id}/edit`)}
        onDelete={(song) => setDeleteTarget(song)}
      />

      <DeleteSongModal song={deleteTarget} deleting={deleting} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </View>
  );
}
