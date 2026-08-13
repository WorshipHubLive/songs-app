import { SongCard } from '@/components/song-card';
import type { MockSong } from '@/constants/mock-songs';
import { FlatList } from 'react-native';

export type SongListProps = {
  songs: MockSong[];
  onPressSong: (song: MockSong) => void;
  onToggleService: (song: MockSong) => void;
  onTranslate: (song: MockSong) => void;
  onEdit: (song: MockSong) => void;
  onDelete: (song: MockSong) => void;
};

// Android/web variant — plain FlatList, just the on-card "add to
// service" button. See song-list.ios.tsx for the iOS variant, which adds
// native swipe-to-reveal Translate/Edit/Delete (no @expo/ui equivalent
// exists for Android, so those three stay iOS-only).
export function SongList({ songs, onPressSong, onToggleService }: SongListProps) {
  return (
    <FlatList
      data={songs}
      keyExtractor={(item) => String(item.id)}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="gap-4 px-4 pb-8 pt-4"
      renderItem={({ item }) => (
        <SongCard song={item} onPress={() => onPressSong(item)} onToggleService={() => onToggleService(item)} />
      )}
    />
  );
}
