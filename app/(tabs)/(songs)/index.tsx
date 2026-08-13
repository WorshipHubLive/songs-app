import { AmbientGlow } from '@/components/ambient-glow';
import { DeleteSongModal } from '@/components/delete-song-modal';
import { SendToWorshipHubSheet } from '@/components/send-to-worshiphub-sheet';
import { SongList } from '@/components/song-list';
import type { Song } from '@/db/schema';
import { allSongsQuery, deleteSong, setInService } from '@/db/songs-repository';
import CheckCircleIcon from '@expo/material-symbols/check_circle.xml';
import SendIcon from '@expo/material-symbols/send.xml';
import SyncIcon from '@expo/material-symbols/sync.xml';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

// Mirrors Library.tsx. The top bar (title, search, sync) is the real
// native header — Stack.Title (asChild, so it's a plain styled Text
// instead of the iOS large-title look) for the title, Stack.SearchBar
// for the native search field, Stack.Toolbar for the sync action.
// There's no custom-drawn top bar or floating "+" button — those aren't
// native iOS patterns; "Add" lives as its own search-role tab instead
// (see (tabs)/_layout.tsx).
//
// "Enviar a WorshipHub" select mode lives here (not on the Service
// screen, which always sends its whole queue) — same split as the web
// app's Library grid select mode, just triggered by a toolbar toggle
// instead of a long-press.
export default function LibraryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Song | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sendVisible, setSendVisible] = useState(false);

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

  const cancelSelecting = () => {
    setSelecting(false);
    setSelectedIds(new Set());
  };

  const handleToggleSelect = (song: Song) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(song.id)) next.delete(song.id);
      else next.add(song.id);
      return next;
    });
  };

  return (
    <View className="flex-1 bg-background">
      <AmbientGlow />

      <Stack.Title asChild>
        <Text className="font-sora-bold text-xl text-foreground">Songs</Text>
      </Stack.Title>
      {!selecting && (
        <Stack.SearchBar
          placeholder="Buscar canciones..."
          onChangeText={(e) => setSearch(e.nativeEvent.text)}
          onCancelButtonPress={() => setSearch('')}
          obscureBackground={false}
        />
      )}
      <Stack.Toolbar placement="right">
        {selecting ? (
          <>
            <Stack.Toolbar.Button onPress={cancelSelecting}>Cancelar</Stack.Toolbar.Button>
            <Stack.Toolbar.Button
              icon={Platform.OS === 'ios' ? 'paperplane' : SendIcon}
              onPress={() => setSendVisible(true)}
              disabled={selectedIds.size === 0}
            >
              {selectedIds.size > 0 && <Stack.Toolbar.Badge>{String(selectedIds.size)}</Stack.Toolbar.Badge>}
            </Stack.Toolbar.Button>
          </>
        ) : (
          <>
            <Stack.Toolbar.Button icon={Platform.OS === 'ios' ? 'arrow.triangle.2.circlepath' : SyncIcon} onPress={() => {}} />
            <Stack.Toolbar.Button
              icon={Platform.OS === 'ios' ? 'checkmark.circle' : CheckCircleIcon}
              onPress={() => setSelecting(true)}
              disabled={songs.length === 0}
            />
          </>
        )}
      </Stack.Toolbar>

      {selecting && (
        <View className="flex-row items-center justify-between px-4 pb-2 pt-1">
          <Text className="font-sora text-xs text-muted-foreground">
            {selectedIds.size} de {songs.length} seleccionadas
          </Text>
          <Pressable onPress={() => setSelectedIds(selectedIds.size === songs.length ? new Set() : new Set(songs.map((s) => s.id)))}>
            <Text className="font-sora-bold text-xs text-primary">{selectedIds.size === songs.length ? 'Ninguna' : 'Todas'}</Text>
          </Pressable>
        </View>
      )}

      <SongList
        songs={songs}
        onPressSong={(song) => router.push(`/${song.id}`)}
        onToggleService={(song) => setInService(song.id, !song.inService)}
        onTranslate={(song) => router.push(`/${song.id}/translate`)}
        onEdit={(song) => router.push(`/${song.id}/edit`)}
        onDelete={(song) => setDeleteTarget(song)}
        selectable={selecting}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
      />

      <DeleteSongModal song={deleteTarget} deleting={deleting} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />

      <SendToWorshipHubSheet
        visible={sendVisible}
        count={selectedIds.size}
        onClose={() => {
          setSendVisible(false);
          cancelSelecting();
        }}
      />
    </View>
  );
}
