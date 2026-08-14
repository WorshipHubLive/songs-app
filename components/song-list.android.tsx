import type { LucideIcon } from 'lucide-react-native';
import { Languages, Pencil, Trash2 } from 'lucide-react-native';
import { FlatList, Pressable, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { SongCard } from '@/components/song-card';
import type { Song } from '@/db/schema';
import type { SongListProps } from './song-list';

function SwipeAction({
  label,
  icon: Icon,
  className,
  onPress,
}: {
  label: string;
  icon: LucideIcon;
  className: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className={`w-20 items-center justify-center gap-1 ${className}`}>
      <Icon size={20} color="#ffffff" strokeWidth={2} />
      <Text className="font-sora-semibold text-[11px] text-white">{label}</Text>
    </Pressable>
  );
}

function SongRow({
  song,
  onPress,
  onToggleService,
  onTranslate,
  onEdit,
  onDelete,
  selectable,
  selected,
  onToggleSelect,
}: {
  song: Song;
  onPress: () => void;
  onToggleService: () => void;
  onTranslate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  return (
    <Swipeable
      renderRightActions={() => (
        <View className="mb-4 ml-3 flex-row overflow-hidden rounded-md">
          <SwipeAction label="Traducir" icon={Languages} className="bg-secondary" onPress={onTranslate} />
          <SwipeAction label="Editar" icon={Pencil} className="bg-muted-foreground" onPress={onEdit} />
          <SwipeAction label="Eliminar" icon={Trash2} className="bg-destructive" onPress={onDelete} />
        </View>
      )}
    >
      <SongCard
        song={song}
        onPress={onPress}
        onToggleService={onToggleService}
        selectable={selectable}
        selected={selected}
        onToggleSelect={onToggleSelect}
      />
    </Swipeable>
  );
}

// Android variant — react-native-gesture-handler's Swipeable reveals
// Translate/Edit/Delete (no @expo/ui equivalent exists for Android; iOS
// gets the real native SwiftUI SwipeActions instead, see
// song-list.ios.tsx). Requires GestureHandlerRootView at the app root
// (see app/_layout.tsx) or the gesture silently does nothing.
export function SongList({
  songs,
  onPressSong,
  onToggleService,
  onTranslate,
  onEdit,
  onDelete,
  selectable,
  selectedIds,
  onToggleSelect,
  listHeader,
}: SongListProps) {
  return (
    <FlatList
      data={songs}
      keyExtractor={(item) => String(item.id)}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="gap-4 px-4 pb-8 pt-4"
      ListHeaderComponent={listHeader}
      renderItem={({ item }) => (
        <SongRow
          song={item}
          onPress={() => onPressSong(item)}
          onToggleService={() => onToggleService(item)}
          onTranslate={() => onTranslate(item)}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
          selectable={selectable}
          selected={selectedIds?.has(item.id)}
          onToggleSelect={() => onToggleSelect?.(item)}
        />
      )}
    />
  );
}
