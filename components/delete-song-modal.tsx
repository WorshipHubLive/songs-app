import type { Song } from '@/db/schema';
import { Modal, Pressable, Text, View } from 'react-native';

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
  return (
    <Modal visible={song !== null} animationType="fade" transparent onRequestClose={onCancel}>
      <Pressable className="flex-1 items-center justify-center bg-black/60 px-8" onPress={onCancel}>
        <Pressable className="w-full max-w-sm gap-4 rounded-2xl border border-border bg-card p-5" onPress={(e) => e.stopPropagation()}>
          <View className="gap-1">
            <Text className="font-sora-bold text-base text-foreground">Eliminar canción</Text>
            <Text className="font-sora text-sm text-muted-foreground">
              ¿Seguro que quieres eliminar {song ? `"${song.title}"` : 'esta canción'}? Esta acción no se puede deshacer.
            </Text>
          </View>
          <View className="flex-row justify-end gap-2">
            <Pressable onPress={onCancel} disabled={deleting} className="rounded-full bg-muted px-4 py-2">
              <Text className="font-sora-bold text-xs text-foreground">Cancelar</Text>
            </Pressable>
            <Pressable onPress={onConfirm} disabled={deleting} className="rounded-full bg-destructive px-4 py-2">
              <Text className="font-sora-bold text-xs text-white">{deleting ? 'Eliminando…' : 'Eliminar'}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
