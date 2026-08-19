import CloudUploadIcon from '@expo/material-symbols/cloud_upload.xml';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Stack, useRouter } from 'expo-router';
import { CalendarCheck } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Text, View } from 'react-native';
import { AmbientGlow } from '@/components/ambient-glow';
import { DeleteSongModal } from '@/components/delete-song-modal';
import { SendToWorshipHubSheet } from '@/components/send-to-worshiphub-sheet';
import { ServiceSongList } from '@/components/service-song-list';
import type { Song } from '@/db/schema';
import { deleteSong, reorderService, serviceSongsQuery, setInService } from '@/db/songs-repository';
import { useAppSettings } from '@/hooks/use-app-settings';
import { useThemeColors } from '@/hooks/use-theme-colors';

// Mirrors Service.tsx — native Stack.Title + a native Stack.Toolbar "Send
// to WorshipHub" button (badged with the queue count) replace the custom
// top bar. Reuses SongList (same swipe-to-translate/edit/delete as the
// library) since a service song is a library song, just filtered.
// Sending ALWAYS sends the whole queue — there's no per-song picker
// here, that lives on the Songs screen's own select mode instead (see
// (songs)/index.tsx) — same split as the web app: Service is a queue you
// build up over time and ship as a batch, not something you re-filter on
// the way out the door.
export default function ServiceScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { clearServiceSongSettings } = useAppSettings();
  const [deleteTarget, setDeleteTarget] = useState<Song | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sendVisible, setSendVisible] = useState(false);
  const [reordering, setReordering] = useState(false);

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
        <Text className="font-sora-bold text-xl text-foreground">{t('service.title')}</Text>
      </Stack.Title>
      <Stack.Toolbar placement="right">
        {/* Android/web can always drag (long-press the grip handle), so
            this toggle — which only drives SwiftUI's editMode — is
            iOS-only; showing it elsewhere would just be a button that
            does nothing. */}
        {Platform.OS === 'ios' && songs.length > 1 && (
          <Stack.Toolbar.Button
            icon={reordering ? 'checkmark' : 'arrow.up.arrow.down'}
            onPress={() => setReordering((v) => !v)}
          />
        )}
        <Stack.Toolbar.Button
          icon={Platform.OS === 'ios' ? 'icloud.and.arrow.up' : CloudUploadIcon}
          onPress={() => setSendVisible(true)}
          disabled={songs.length === 0}
        >
          {songs.length > 0 && <Stack.Toolbar.Badge>{String(songs.length)}</Stack.Toolbar.Badge>}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>

      {songs.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-2 px-10">
          <CalendarCheck size={40} color={colors.mutedForeground} strokeWidth={1.5} />
          <Text className="mt-2 font-sora-semibold text-base text-foreground">{t('service.emptyTitle')}</Text>
          <Text className="text-center font-sora text-xs text-muted-foreground">{t('service.emptyDescription')}</Text>
        </View>
      ) : (
        <ServiceSongList
          songs={songs}
          reordering={reordering}
          onPressSong={(song) => router.push(`/${song.id}/slides`)}
          onToggleService={(song) => {
            setInService(song.id, !song.inService);
            if (song.inService) clearServiceSongSettings(song.id);
          }}
          onTranslate={(song) => router.push(`/${song.id}/translate`)}
          onEdit={(song) => router.push(`/${song.id}/edit`)}
          onDelete={(song) => setDeleteTarget(song)}
          onReorder={reorderService}
        />
      )}

      <DeleteSongModal song={deleteTarget} deleting={deleting} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />

      <SendToWorshipHubSheet
        visible={sendVisible}
        songIds={songs.map((s) => s.id)}
        onClose={() => setSendVisible(false)}
        onSent={() => {
          // A sent service is done being that service — same as the web
          // app clearing its queue (and every song's language/slide
          // choices) after a successful send.
          for (const song of songs) {
            void setInService(song.id, false);
            clearServiceSongSettings(song.id);
          }
        }}
      />
    </View>
  );
}
