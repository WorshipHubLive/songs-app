import { accentClasses } from '@/constants/accent-classes';
import type { MockSong } from '@/constants/mock-songs';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { CalendarCheck, CalendarPlus } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { Card } from './ui/card';

// Mirrors SongCard.tsx's colored left-border accent cycle. Content is
// deliberately minimal now — just title + artist. Translate/Edit/Delete
// moved to native swipe actions on iOS (see (songs)/index.tsx); "add to
// service" is the one action that stays directly on the card, bigger and
// pinned top-right.
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
      <Card accentClassName={accent.border} className="flex-row items-start justify-between gap-3 overflow-hidden">
        <View pointerEvents="none" className={`absolute -right-8 -top-8 w-28 rounded-full opacity-20 ${accent.tint}`} />

        <View className="flex-1">
          <Text className="font-sora-semibold text-lg text-foreground" numberOfLines={1}>
            {song.title}
          </Text>
          <Text className={`font-sora text-sm ${accent.text}`} numberOfLines={1}>
            {song.artist}
          </Text>
        </View>

        <Pressable
          onPress={onToggleService}
          className={`h-10 w-10 items-center justify-center rounded-full ${song.inService ? 'bg-primary/15' : 'bg-muted'}`}
        >
          {song.inService ? (
            <CalendarCheck size={20} color={colors.primary} strokeWidth={2} />
          ) : (
            <CalendarPlus size={20} color={colors.mutedForeground} strokeWidth={2} />
          )}
        </Pressable>
      </Card>
    </Pressable>
  );
}
