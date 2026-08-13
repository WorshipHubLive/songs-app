import { AmbientGlow } from '@/components/ambient-glow';
import { SongCard } from '@/components/song-card';
import { mockSongs } from '@/constants/mock-songs';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Text, View } from 'react-native';

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

      <FlatList
        data={songs}
        keyExtractor={(item) => String(item.id)}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 px-4 pb-8 pt-4"
        
        renderItem={({ item }) => <SongCard song={item} onPress={() => router.push(`/song/${item.id}`)} />}
        ListFooterComponent={
          <View className="mt-3 items-center">
            <View className="flex-row items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5">
              <View className="h-1.5 w-1.5 rounded-full bg-primary" />
              <Text className="font-sora-semibold text-[10px] tracking-wide text-muted-foreground">
                {mockSongs.length} CANCIONES EN TOTAL
              </Text>
            </View>
          </View>
        }
      />
    </View>
  );
}
