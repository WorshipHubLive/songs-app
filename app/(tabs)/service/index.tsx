import { AmbientGlow } from '@/components/AmbientGlow';
import { SongCard } from '@/components/SongCard';
import { mockSongs } from '@/constants/mockSongs';
import { fonts, radius, spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Stack, useRouter } from 'expo-router';
import { CalendarCheck, GripVertical } from 'lucide-react-native';
import { FlatList, Text, View } from 'react-native';

// Mirrors Service.tsx — native Stack.Title + a native Stack.Toolbar "Send
// to WorshipHub" button replace the custom top bar.
export default function ServiceScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const songs = mockSongs.filter((s) => s.inService);

  const unreadCount = 10;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <AmbientGlow />

      <Stack.Title asChild>
        <View style={{ width: "100%" }}>
          <Text style={{ color: theme.primary }}>Service</Text>
        </View>
      </Stack.Title>
      

      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="icloud.and.arrow.up"
          onPress={() => { }}>
          {songs.length > 0 && <Stack.Toolbar.Badge>{String(songs.length)}</Stack.Toolbar.Badge>}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>



      {songs.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 40 }}>
          <CalendarCheck size={40} color={theme.mutedForeground} strokeWidth={1.5} />
          <Text style={{ fontSize: 16, fontFamily: fonts.headingSemibold, color: theme.foreground, marginTop: 8 }}>
            No hay canciones en el servicio
          </Text>
          <Text style={{ fontSize: 12, fontFamily: fonts.body, color: theme.mutedForeground, textAlign: 'center' }}>
            Agrega canciones desde tu biblioteca para armar el orden del servicio.
          </Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => String(item.id)}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: spacing.xl,
            gap: spacing.lg,
          }}
          renderItem={({ item }) => (
            <View>
              <SongCard song={item} onPress={() => router.push(`/song/${item.id}`)} />
              <View
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 26,
                  height: 26,
                  borderRadius: radius.sm,
                  borderWidth: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                }}
              >
                <GripVertical size={14} color={theme.mutedForeground} />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
