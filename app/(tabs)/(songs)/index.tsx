import { AmbientGlow } from '@/components/ambient-glow';
import { SongList } from '@/components/song-list';
import { mockSongs } from '@/constants/mock-songs';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

// Mirrors Library.tsx. The top bar (title, search, sync) is the real
// native header — Stack.Title (asChild, so it's a plain styled Text
// instead of the iOS large-title look) for the title, Stack.SearchBar
// for the native search field, Stack.Toolbar for the sync action.
// There's no custom-drawn top bar or floating "+" button — those aren't
// native iOS patterns; "Add" lives as its own search-role tab instead
// (see (tabs)/_layout.tsx).
export default function LibraryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const songs = mockSongs.filter((s) => `${s.title} ${s.artist}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <View className="flex-1 bg-background">
      <AmbientGlow />

      <Stack.Title asChild>
        <Text className="font-sora-bold text-xl text-foreground">Songs</Text>
      </Stack.Title>
      <Stack.SearchBar
        placeholder="Buscar canciones..."
        onChangeText={(e) => setSearch(e.nativeEvent.text)}
        onCancelButtonPress={() => setSearch('')}
        obscureBackground={false}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="arrow.triangle.2.circlepath" onPress={() => {}} />
      </Stack.Toolbar>

      <SongList
        songs={songs}
        onPressSong={(song) => router.push(`/song/${song.id}`)}
        onToggleService={() => {}}
        onTranslate={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </View>
  );
}
