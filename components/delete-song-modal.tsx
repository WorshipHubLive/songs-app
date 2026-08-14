import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';
import type { Song } from '@/db/schema';

export function DeleteSongModal({
  song,
  deleting,
  onCancel,
  onConfirm,
}: {
  song: Song | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal visible={song !== null} animationType="fade" transparent onRequestClose={onCancel}>
      <Pressable className="flex-1 items-center justify-center bg-black/60 px-8" onPress={onCancel}>
        <Pressable
          className="w-full max-w-sm gap-4 rounded-2xl border border-border bg-card p-5"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="gap-1">
            <Text className="font-sora-bold text-base text-foreground">{t('deleteSongModal.title')}</Text>
            <Text className="font-sora text-sm text-muted-foreground">
              {song ? t('deleteSongModal.messageWithTitle', { title: song.title }) : t('deleteSongModal.messageGeneric')}
            </Text>
          </View>
          <View className="flex-row justify-end gap-2">
            <Pressable onPress={onCancel} disabled={deleting} className="rounded-full bg-muted px-4 py-2">
              <Text className="font-sora-bold text-xs text-foreground">{t('common.cancel')}</Text>
            </Pressable>
            <Pressable onPress={onConfirm} disabled={deleting} className="rounded-full bg-destructive px-4 py-2">
              <Text className="font-sora-bold text-xs text-white">{deleting ? t('common.deleting') : t('common.delete')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
