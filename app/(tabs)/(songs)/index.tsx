import { AmbientGlow } from '@/components/AmbientGlow';
import { SongCard } from '@/components/SongCard';
import { mockSongs } from '@/constants/mockSongs';
import { fonts, radius, spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Text, View } from 'react-native';

// Mirrors Library.tsx, but the top bar (search, sync, sort, add) is now
// the real native header — Stack.Title for the large title, Stack.SearchBar
// for the native search field (collapses into the nav bar like every
// other iOS app), and Stack.Toolbar for the sync/add actions. No more
// custom-drawn top bar or floating "+" button — those aren't native iOS
// patterns; a top-right toolbar button is.
export default function LibraryScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const songs = mockSongs.filter((s) =>
    `${s.title} ${s.artist}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <AmbientGlow />

      <Stack.Title asChild>
        <View style={{width: "100%"}}>
          <Text style={{ color: theme.primary }}>Sonaaa</Text>
        </View>
      </Stack.Title>
      <Stack.SearchBar
        placeholder="Buscar canciones..."
        onChangeText={(e) => setSearch(e.nativeEvent.text)}
        onCancelButtonPress={() => setSearch('')}
        obscureBackground={false}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="arrow.triangle.2.circlepath" onPress={() => { }} />
      </Stack.Toolbar>

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
        ListHeaderComponent={
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            {songs.length} canciones en tu biblioteca
          </Text>
        }
        renderItem={({ item }) => (
          <SongCard song={item} onPress={() => router.push(`/song/${item.id}`)} />
        )}
        ListFooterComponent={
          <View style={styles.countPillWrap}>
            <View style={[styles.countPill, { borderColor: theme.border, backgroundColor: theme.card }]}>
              <View style={[styles.countDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.countText, { color: theme.mutedForeground }]}>
                {mockSongs.length} CANCIONES EN TOTAL
              </Text>
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = {
  subtitle: { fontSize: 13, fontFamily: fonts.body, marginBottom: spacing.md } as const,
  countPillWrap: { alignItems: 'center' as const, marginTop: spacing.md },
  countPill: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  countDot: { width: 6, height: 6, borderRadius: 3 },
  countText: { fontSize: 10, fontFamily: fonts.headingSemibold, letterSpacing: 0.5 },
};
