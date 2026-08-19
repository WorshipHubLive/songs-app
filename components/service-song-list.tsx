import type { LucideIcon } from 'lucide-react-native';
import { ChevronDown, ChevronUp, Languages, Pencil, Trash2 } from 'lucide-react-native';
import { FlatList, Pressable, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { SongCard } from '@/components/song-card';
import type { Song } from '@/db/schema';
import { useThemeColors } from '@/hooks/use-theme-colors';

export type ServiceSongListProps = {
  songs: Song[];
  onPressSong: (song: Song) => void;
  onToggleService: (song: Song) => void;
  onTranslate: (song: Song) => void;
  onEdit: (song: Song) => void;
  onDelete: (song: Song) => void;
  onReorder: (orderedIds: number[]) => void;
  /** iOS-only: toggles the native SwiftUI edit mode that reveals drag
   * handles (see service-song-list.ios.tsx). Unused here — this
   * variant's up/down buttons are always active. */
  reordering?: boolean;
};

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

function swapped(songs: Song[], index: number, direction: -1 | 1): number[] {
  const target = index + direction;
  const next = [...songs];
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((s) => s.id);
}

// Android/web variant — deliberately NOT a drag gesture. An earlier pass
// used react-native-draggable-flatlist, but that library has open,
// unresolved issues specifically on Android with the New Architecture
// (this app has newArchEnabled=true) — flicker on drop and drag not
// activating at all on some devices/versions. Up/down buttons are
// slower to use but always work, on every device, with zero gesture
// ambiguity — worth the tradeoff for something as infrequent as
// reordering a service queue. Swipe-to-reveal Translate/Edit/Delete is
// unchanged from song-list.android.tsx.
export function ServiceSongList({
  songs,
  onPressSong,
  onToggleService,
  onTranslate,
  onEdit,
  onDelete,
  onReorder,
}: ServiceSongListProps) {
  const colors = useThemeColors();

  return (
    <FlatList
      data={songs}
      keyExtractor={(item) => String(item.id)}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="gap-4 px-4 pb-8 pt-4"
      renderItem={({ item, index }) => (
        <View className="flex-row items-center gap-2">
          <View className="gap-0.5">
            <Pressable
              onPress={() => onReorder(swapped(songs, index, -1))}
              disabled={index === 0}
              className={`h-7 w-7 items-center justify-center rounded-md ${index === 0 ? 'opacity-30' : 'active:bg-muted'}`}
            >
              <ChevronUp size={16} color={colors.mutedForeground} />
            </Pressable>
            <Pressable
              onPress={() => onReorder(swapped(songs, index, 1))}
              disabled={index === songs.length - 1}
              className={`h-7 w-7 items-center justify-center rounded-md ${index === songs.length - 1 ? 'opacity-30' : 'active:bg-muted'}`}
            >
              <ChevronDown size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View className="flex-1">
            <Swipeable
              renderRightActions={() => (
                <View className="mb-4 ml-3 flex-row overflow-hidden rounded-md">
                  <SwipeAction label="Traducir" icon={Languages} className="bg-secondary" onPress={() => onTranslate(item)} />
                  <SwipeAction label="Editar" icon={Pencil} className="bg-muted-foreground" onPress={() => onEdit(item)} />
                  <SwipeAction label="Eliminar" icon={Trash2} className="bg-destructive" onPress={() => onDelete(item)} />
                </View>
              )}
            >
              <SongCard
                song={item}
                onPress={() => onPressSong(item)}
                onToggleService={() => onToggleService(item)}
                toggleServiceClassName="-mr-2"
              />
            </Swipeable>
          </View>
        </View>
      )}
    />
  );
}
