import { AmbientGlow } from '@/components/ambient-glow';
import { DeleteSongModal } from '@/components/delete-song-modal';
import { SongList } from '@/components/song-list';
import type { Song } from '@/db/schema';
import { deleteSong, serviceSongsQuery, setInService } from '@/db/songs-repository';
import { useThemeColors } from '@/hooks/use-theme-colors';
import CloudUploadIcon from '@expo/material-symbols/cloud_upload.xml';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Stack, useRouter } from 'expo-router';
import { CalendarCheck } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Text, View } from 'react-native';

// Mirrors Service.tsx — native Stack.Title + a native Stack.Toolbar "Send
// to WorshipHub" button (badged with the queue count) replace the custom
// top bar. Reuses SongList (same swipe-to-translate/edit/delete as the
// library) since a service song is a library song, just filtered.
export default function ServiceScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Song | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data } = useLiveQuery(serviceSongsQuery());
  const songs = data ?? [];

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
        <Text className="font-sora-bold text-xl text-foreground">Service</Text>
      </Stack.Title>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon={Platform.OS === 'ios' ? 'icloud.and.arrow.up' : CloudUploadIcon} onPress={() => {}}>
          {songs.length > 0 && <Stack.Toolbar.Badge>{String(songs.length)}</Stack.Toolbar.Badge>}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>

      {songs.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-2 px-10">
          <CalendarCheck size={40} color={colors.mutedForeground} strokeWidth={1.5} />
          <Text className="mt-2 font-sora-semibold text-base text-foreground">No hay canciones en el servicio</Text>
          <Text className="text-center font-sora text-xs text-muted-foreground">
            Agrega canciones desde tu biblioteca para armar el orden del servicio.
          </Text>
        </View>
      ) : (
        <SongList
          songs={songs}
          onPressSong={(song) => router.push(`/${song.id}`)}
          onToggleService={(song) => setInService(song.id, !song.inService)}
          onTranslate={(song) => router.push(`/${song.id}/translate`)}
          onEdit={(song) => router.push(`/${song.id}/edit`)}
          onDelete={(song) => setDeleteTarget(song)}
        />
      )}

      <DeleteSongModal song={deleteTarget} deleting={deleting} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </View>
  );
}
