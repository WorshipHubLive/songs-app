import { Button, Host, List, RNHostView, Section, SwipeActions } from '@expo/ui/swift-ui';
import { environment, listRowBackground, listRowSeparator, listStyle } from '@expo/ui/swift-ui/modifiers';
import { SongCard } from '@/components/song-card';
import type { ServiceSongListProps } from './service-song-list';

// iOS variant — real native SwiftUI drag-to-reorder (`List.ForEach`'s
// `onMove`, https://developer.apple.com/documentation/swiftui/dynamicviewcontent/onmove(perform:)),
// not a hand-rolled gesture, layered on the same List + SwipeActions
// shape as song-list.ios.tsx. Needs `editMode` active to show the
// native reorder handles — the Service screen toggles that via a
// Stack.Toolbar "Reorder"/"Listo" button, same native pattern as the
// system Reminders/Mail apps. `onDelete` deliberately left unset on the
// ForEach: edit mode should only reveal drag handles here, not the
// red delete circles — deleting still goes through the row's own
// SwipeActions regardless of reorder mode.
export function ServiceSongList({
  songs,
  reordering,
  onPressSong,
  onToggleService,
  onTranslate,
  onEdit,
  onDelete,
  onReorder,
}: ServiceSongListProps) {
  return (
    <Host style={{ flex: 1, paddingHorizontal: 16 }}>
      <List modifiers={[listStyle('plain'), environment({ key: 'editMode', value: reordering ? 'active' : 'inactive' })]}>
        <List.ForEach
          onMove={(sourceIndices, destination) => {
            const next = [...songs];
            // SwiftUI's onMove gives every dragged source index at once
            // (multi-select drag) — service reorder is always a single
            // row, but handle the general case: pull them all out, then
            // reinsert in original relative order at the destination.
            const moving = sourceIndices.map((i) => next[i]);
            for (const i of [...sourceIndices].sort((a, b) => b - a)) next.splice(i, 1);
            const adjustedDestination = destination - sourceIndices.filter((i) => i < destination).length;
            next.splice(adjustedDestination, 0, ...moving);
            onReorder(next.map((s) => s.id));
          }}
        >
          {songs.map((song) => (
            <Section key={song.id} modifiers={[listRowBackground('clear'), listRowSeparator('hidden')]}>
              <SwipeActions>
                <RNHostView matchContents>
                  <SongCard
                    song={song}
                    onPress={() => onPressSong(song)}
                    onToggleService={() => onToggleService(song)}
                    toggleServiceClassName="-mr-2"
                  />
                </RNHostView>
                {/* SwiftUI reveals swipe actions in declaration order,
                    closest-to-content first — Delete used to be first
                    here, making it the easiest one to hit on a short
                    swipe. Translate/Edit now come first; Delete is last,
                    farthest from the content edge. */}
                <SwipeActions.Actions edge="trailing" allowsFullSwipe={false}>
                  <Button label="Translate" systemImage="character.bubble" onPress={() => onTranslate(song)} />
                  <Button label="Edit" systemImage="pencil" onPress={() => onEdit(song)} />
                  <Button label="Delete" systemImage="trash" role="destructive" onPress={() => onDelete(song)} />
                </SwipeActions.Actions>
              </SwipeActions>
            </Section>
          ))}
        </List.ForEach>
      </List>
    </Host>
  );
}
