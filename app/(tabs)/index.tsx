import React, { useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal, Plus, RefreshCw } from 'lucide-react-native';
import { AmbientGlow } from '@/components/AmbientGlow';
import { SongCard } from '@/components/SongCard';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fonts, radius, spacing } from '@/constants/theme';
import { mockSongs } from '@/constants/mockSongs';

// Mirrors Library.tsx: mobile "Local Sync" quick-action card, header,
// searchable/sortable card list, count pill, floating "+" action button.
export default function LibraryScreen() {
  const { theme, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const songs = mockSongs.filter((s) =>
    `${s.title} ${s.artist}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <AmbientGlow />

      {/* Top bar — Library mode */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 10,
            backgroundColor: isDark ? 'rgba(6,8,15,0.8)' : 'rgba(246,248,250,0.8)',
            borderBottomColor: theme.border,
          },
        ]}
      >
        <Image
          source={require('@/assets/brand/WorshipHub_Songs_Icon.png')}
          style={styles.brandIcon}
          resizeMode="contain"
        />
        <View
          style={[
            styles.searchBox,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Search size={15} color={theme.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar canciones..."
            placeholderTextColor={theme.mutedForeground}
            style={[styles.searchInput, { color: theme.foreground }]}
          />
        </View>
        <Pressable style={[styles.syncPill, { borderColor: theme.border }]}>
          <RefreshCw size={13} color={theme.mutedForeground} />
          <View style={[styles.syncDot, { backgroundColor: theme.primary }]} />
        </Pressable>
      </View>

      <FlatList
        data={songs}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: insets.bottom + 100,
          gap: spacing.lg,
        }}
        ListHeaderComponent={
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.h1, { color: theme.foreground }]}>Songs</Text>
              <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
                {songs.length} canciones en tu biblioteca
              </Text>
            </View>
            <Pressable
              style={[styles.sortButton, { borderColor: theme.border }]}
            >
              <SlidersHorizontal size={14} color={theme.foreground} />
            </Pressable>
          </View>
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

      {/* Floating action button */}
      <Pressable
        onPress={() => router.push('/song/new')}
        style={[
          styles.fab,
          { bottom: insets.bottom + 24, backgroundColor: theme.primary },
        ]}
      >
        <Plus size={24} color={theme.primaryForeground} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  brandIcon: { width: 32, height: 32, borderRadius: 8 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    height: 38,
  },
  searchInput: { flex: 1, fontSize: 13, fontFamily: fonts.body },
  syncPill: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  h1: { fontSize: 26, fontFamily: fonts.heading, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontFamily: fonts.body, marginTop: 2 },
  sortButton: {
    width: 36,
    height: 36,
    borderRadius: radius.sm + 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPillWrap: { alignItems: 'center', marginTop: spacing.md },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  countDot: { width: 6, height: 6, borderRadius: 3 },
  countText: { fontSize: 10, fontFamily: fonts.headingSemibold, letterSpacing: 0.5 },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
