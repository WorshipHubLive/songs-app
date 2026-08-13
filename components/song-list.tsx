import { SongCard } from '@/components/song-card';
import type { Song } from '@/db/schema';
import { FlatList } from 'react-native';

export type SongListProps = {
  songs: Song[];
  onPressSong: (song: Song) => void;
  onToggleService: (song: Song) => void;
  onTranslate: (song: Song) => void;
  onEdit: (song: Song) => void;
  onDelete: (song: Song) => void;
  /** Service screen's "which of these do I send" checkbox picker. */
  selectable?: boolean;
  selectedIds?: Set<number>;
  onToggleSelect?: (song: Song) => void;
};

// Android/web variant — plain FlatList, just the on-card "add to
// service" button. See song-list.ios.tsx for the iOS variant, which adds
// native swipe-to-reveal Translate/Edit/Delete (no @expo/ui equivalent
// exists for Android, so those three stay iOS-only).
export function SongList({ songs, onPressSong, onToggleService, selectable, selectedIds, onToggleSelect }: SongListProps) {
  return (
    <FlatList
      data={songs}
      keyExtractor={(item) => String(item.id)}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="gap-4 px-4 pb-8 pt-4"
      renderItem={({ item }) => (
        <SongCard
          song={item}
          onPress={() => onPressSong(item)}
          onToggleService={() => onToggleService(item)}
          selectable={selectable}
          selected={selectedIds?.has(item.id)}
          onToggleSelect={() => onToggleSelect?.(item)}
        />
      )}
    />
  );
}
