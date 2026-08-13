import { accentClasses } from '@/constants/accent-classes';
import type { MockSong } from '@/constants/mock-songs';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { CalendarCheck, CalendarPlus, Globe, Languages, Pencil, Trash2 } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { Card } from './ui/card';
import { IconButton } from './ui/icon-button';

// Mirrors SongCard.tsx: colored left-border cycling primary/secondary/
// accent by `id % 3`, glowing tinted orb top-right, language badge,
// title/artist/lyric-snippet, and a footer icon-button row.
export function SongCard({
  song,
  onPress,
  onToggleService,
}: {
  song: MockSong;
  onPress?: () => void;
  onToggleService?: () => void;
}) {
  const colors = useThemeColors();
  const accent = accentClasses(song.id);

  return (
    <Pressable onPress={onPress}>
      <Card accentClassName={accent.border} className="gap-2 overflow-hidden">
        <View pointerEvents="none" className={`absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-20 ${accent.tint}`} />

        {song.languages > 1 && (
          <View className="flex-row items-center gap-1 self-start rounded-full border border-secondary px-2 py-1">
            <Globe size={11} color={colors.secondary} strokeWidth={2.5} />
            <Text className="font-sora-semibold text-[10px] text-secondary">{song.languages} idiomas</Text>
          </View>
        )}

        <Text className="font-sora-semibold text-lg text-foreground" numberOfLines={1}>
          {song.title}
        </Text>
        <Text className={`font-sora text-sm ${accent.text}`} numberOfLines={1}>
          {song.artist}
        </Text>
        <Text className="font-sora text-xs italic leading-[17px] text-muted-foreground" numberOfLines={3}>
          {song.snippet}
        </Text>

        <View className="mt-1 flex-row items-center justify-between">
          <View className="flex-row gap-1">
            <IconButton icon={Languages} color={colors.mutedForeground} />
            <IconButton icon={Pencil} color={colors.mutedForeground} />
            <IconButton
              icon={song.inService ? CalendarCheck : CalendarPlus}
              color={song.inService ? colors.primary : colors.mutedForeground}
              onPress={onToggleService}
            />
          </View>
          <IconButton icon={Trash2} color={colors.destructive} className="bg-destructive/10" />
        </View>
      </Card>
    </Pressable>
  );
}
