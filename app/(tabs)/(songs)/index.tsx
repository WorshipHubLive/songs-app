import { AmbientGlow } from '@/components/ambient-glow';
import { DeleteSongModal } from '@/components/delete-song-modal';
import { SendToLocalPeerSheet } from '@/components/send-to-local-peer-sheet';
import { SongList } from '@/components/song-list';
import type { Song } from '@/db/schema';
import { allSongsQuery, deleteSong, setInService } from '@/db/songs-repository';
import ShareIcon from '@expo/material-symbols/ios_share.xml';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Text, View } from 'react-native';

// One toolbar button, share icon (same shape as standalone/songs'
// selection flow, just a single always-visible entry point instead of a
// laptop icon). Tap 1: not selecting yet -> enters selection mode
// (checkboxes appear on the cards, see song-card.tsx `selectable`).
// While selecting, the SAME button carries a badge with the running
// count. Tap 2: selecting with >=1 picked -> opens the "where to send"
// sheet (currently just Local Sync, i.e. another Songs instance). Tap
// with 0 picked just cancels selection mode. WorshipHub sending is never
// a Library selection — that's Service's whole queue, see
// (tabs)/service/index.tsx.
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

  const handleShareButtonPress = () => {
    if (!selecting) {
      setSelecting(true);
      return;
    }
    if (selectedIds.size > 0) {
      setSendVisible(true);
    } else {
      cancelSelecting();
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
        <Stack.Toolbar.Button
          icon={Platform.OS === 'ios' ? 'square.and.arrow.up' : ShareIcon}
          onPress={handleShareButtonPress}
          disabled={songs.length === 0}
        >
          {selecting && selectedIds.size > 0 && <Stack.Toolbar.Badge>{String(selectedIds.size)}</Stack.Toolbar.Badge>}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>

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

      <SendToLocalPeerSheet
        visible={sendVisible}
        songIds={[...selectedIds]}
        onClose={() => {
          setSendVisible(false);
          cancelSelecting();
        }}
        onSent={cancelSelecting}
      />
    </View>
  );
}
