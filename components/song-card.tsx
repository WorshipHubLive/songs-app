import { CalendarCheck, CalendarPlus, Check } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { accentClasses } from '@/constants/accent-classes';
import type { Song } from '@/db/schema';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Card } from './ui/card';

// Mirrors SongCard.tsx's colored left-border accent cycle. Content is
// deliberately minimal now — just title + artist. Translate/Edit/Delete
// moved to native swipe actions on iOS (see (songs)/index.tsx). `selectable`
// mirrors the web card's `selectionMode`: the whole card becomes a single
// toggle (tapping anywhere on it selects instead of navigating) with a
// checkmark badge, and the add-to-service button hides — same "picking
// songs for a bulk action" shape as the web Library grid, used by the
// Songs screen's "Enviar a WorshipHub" select mode (see
// (songs)/index.tsx). Never used on the Service screen, which always
// sends its whole queue — no per-song picker there.
export function SongCard({
  song,
  onPress,
  onToggleService,
  selectable = false,
  selected = false,
  onToggleSelect,
  toggleServiceClassName = '',
}: {
  song: Song;
  onPress?: () => void;
  onToggleService?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  /** Extra classes merged onto the add/remove-from-service button — the
   * Service screen nudges it closer to the true right edge with this
   * (see service-song-list.tsx/.ios.tsx). */
  toggleServiceClassName?: string;
}) {
  const colors = useThemeColors();
  const accent = accentClasses(song.id);

  const titleBlock = (
    <View className="flex-1">
      <Text className="font-sora-semibold text-lg text-foreground" numberOfLines={1}>
        {song.title}
      </Text>
      <Text className={`font-sora text-sm ${accent.text}`} numberOfLines={1}>
        {song.artist}
      </Text>
    </View>
  );

  // `Card` (a View) stays the root element in both modes — never swapped
  // for a `Pressable` root — because the iOS native list
  // (song-list.ios.tsx's RNHostView `matchContents`) measures this row's
  // intrinsic size once; a root *type* change forces React to unmount
  // and remount the whole subtree, which raced with that native
  // measurement and collapsed the row to zero height (cards visually
  // "disappeared" when toggling selection mode). Keeping the same root
  // type across both branches lets React update props in place instead.
  return (
    <Card accentClassName={accent.border} className="flex-row items-start justify-between gap-3 overflow-hidden">
      <View pointerEvents="none" className={`absolute -right-8 -top-8 w-28 rounded-full opacity-20 ${accent.tint}`} />

      {selectable ? (
        // A single Pressable spanning the row — not the sibling
        // title-Pressable/button-Pressable split below — since there's
        // only one tap target here, not two competing for the same row.
        <Pressable onPress={onToggleSelect} className="flex-1 flex-row items-center justify-between gap-3">
          {titleBlock}
          <View
            className={`h-6 w-6 items-center justify-center rounded-full border-2 ${selected ? 'border-primary bg-primary' : 'border-border'}`}
          >
            {selected && <Check size={13} color={colors.primaryForeground} strokeWidth={3} />}
          </View>
        </Pressable>
      ) : (
        <>
          {/* Sibling Pressables, never nested — an "add to service" button
              once nested inside a whole-card Pressable let the outer
              onPress fire on every tap inside the native list embeddings
              (RNHostView/SwiftUI on iOS, Swipeable on Android). Siblings
              with non-overlapping hit areas can't have that ambiguity. */}
          <Pressable onPress={onPress} className="flex-1">
            {titleBlock}
          </Pressable>

          <Pressable
            testID="song-card-toggle-service"
            onPress={onToggleService}
            className={`h-10 w-10 items-center justify-center rounded-full ${song.inService ? 'bg-primary/15' : 'bg-muted'} ${toggleServiceClassName}`}
          >
            {song.inService ? (
              <CalendarCheck size={20} color={colors.primary} strokeWidth={2} />
            ) : (
              <CalendarPlus size={20} color={colors.mutedForeground} strokeWidth={2} />
            )}
          </Pressable>
        </>
      )}
    </Card>
  );
}
