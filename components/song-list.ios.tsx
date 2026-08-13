import { SongCard } from '@/components/song-card';
import { Button, Host, List, RNHostView, Section, SwipeActions } from '@expo/ui/swift-ui';
import { listRowBackground, listRowSeparator, listStyle } from '@expo/ui/swift-ui/modifiers';
import type { SongListProps } from './song-list';

// iOS variant — real native swipe-to-reveal actions (SwiftUI List +
// SwipeActions), with our existing Tailwind-styled SongCard bridged in
// as the row content via RNHostView. `allowsFullSwipe={false}` on the
// trailing group so a full swipe never auto-fires Delete.
export function SongList({ songs, onPressSong, onToggleService, onTranslate, onEdit, onDelete }: SongListProps) {
  
  return (
    <Host style={{ flex: 1, paddingHorizontal: 16 }}>
      <List modifiers={[listStyle("plain")]}>

        {songs.map((song) => (
          <Section key={song.id} modifiers={[listRowBackground('clear'), listRowSeparator('hidden')]}>
            <SwipeActions>
              <RNHostView matchContents>
                <SongCard song={song} onPress={() => onPressSong(song)} onToggleService={() => onToggleService(song)} />
              </RNHostView>
              <SwipeActions.Actions edge="trailing" allowsFullSwipe={false}>
                <Button label="Delete" systemImage="trash" role="destructive" onPress={() => onDelete(song)} />
                <Button label="Edit" systemImage="pencil" onPress={() => onEdit(song)} />
                <Button label="Translate" systemImage="character.bubble" onPress={() => onTranslate(song)} />
              </SwipeActions.Actions>
            </SwipeActions>
          </Section>
        ))}

      </List>


    </Host >
  );
}
