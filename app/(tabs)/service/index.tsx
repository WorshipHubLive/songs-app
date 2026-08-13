import { AmbientGlow } from '@/components/ambient-glow';
import { SongCard } from '@/components/song-card';
import { mockSongs } from '@/constants/mock-songs';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Stack, useRouter } from 'expo-router';
import { CalendarCheck, GripVertical } from 'lucide-react-native';
import { FlatList, Text, View } from 'react-native';

// Mirrors Service.tsx — native Stack.Title + a native Stack.Toolbar "Send
// to WorshipHub" button (badged with the queue count) replace the custom
// top bar.
export default function ServiceScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const songs = mockSongs.filter((s) => s.inService);

  return (
    <View className="flex-1 bg-background">
      <AmbientGlow />

      <Stack.Title asChild>
        <Text className="font-sora-bold text-xl text-foreground">Service</Text>
      </Stack.Title>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="icloud.and.arrow.up" onPress={() => {}}>
          {songs.length > 0 && <Stack.Toolbar.Badge>{String(songs.length)}</Stack.Toolbar.Badge>}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>

      {songs.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-2 px-10">
          <CalendarCheck size={40} color={colors.mutedForeground} strokeWidth={1.5} />
          <Text className="mt-2 font-sora-semibold text-base text-foreground">No hay canciones en el servicio</Text>
          <Text className="text-center font-sora text-xs text-muted-foreground">
            Agrega canciones desde tu biblioteca para armar el orden del servicio.
          </Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => String(item.id)}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-4 px-4 pb-8 pt-4"
          renderItem={({ item }) => (
            <View>
              <SongCard song={item} onPress={() => router.push(`/song/${item.id}`)} />
              <View className="absolute right-3 top-3 h-[26px] w-[26px] items-center justify-center rounded-sm border border-border bg-card">
                <GripVertical size={14} color={colors.mutedForeground} />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
