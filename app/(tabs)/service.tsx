import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloudUpload, GripVertical, CalendarCheck } from 'lucide-react-native';
import { AmbientGlow } from '@/components/AmbientGlow';
import { SongCard } from '@/components/SongCard';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fonts, radius, spacing } from '@/constants/theme';
import { mockSongs } from '@/constants/mockSongs';

// Mirrors Service.tsx: same card grid reused with a drag grip-handle
// overlay, "Send to WorshipHub (N)" action in the top bar.
export default function ServiceScreen() {
  const { theme, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const songs = mockSongs.filter((s) => s.inService);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <AmbientGlow />

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
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.foreground }]}>Service</Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            Songs queued up to send to WorshipHub.
          </Text>
        </View>
        <Pressable
          disabled={songs.length === 0}
          style={[
            styles.sendButton,
            { backgroundColor: theme.primary, opacity: songs.length === 0 ? 0.4 : 1 },
          ]}
        >
          <CloudUpload size={14} color={theme.primaryForeground} strokeWidth={2.5} />
          <Text style={[styles.sendText, { color: theme.primaryForeground }]}>
            Send ({songs.length})
          </Text>
        </Pressable>
      </View>

      {songs.length === 0 ? (
        <View style={styles.empty}>
          <CalendarCheck size={40} color={theme.mutedForeground} strokeWidth={1.5} />
          <Text style={[styles.emptyTitle, { color: theme.foreground }]}>
            No hay canciones en el servicio
          </Text>
          <Text style={[styles.emptyHint, { color: theme.mutedForeground }]}>
            Agrega canciones desde tu biblioteca para armar el orden del servicio.
          </Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: insets.bottom + 32,
            gap: spacing.lg,
          }}
          renderItem={({ item }) => (
            <View>
              <SongCard song={item} onPress={() => router.push(`/song/${item.id}`)} />
              <View style={[styles.gripHandle, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <GripVertical size={14} color={theme.mutedForeground} />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 22, fontFamily: fonts.heading, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, fontFamily: fonts.body, marginTop: 2 },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    height: 34,
  },
  sendText: { fontSize: 11, fontFamily: fonts.headingSemibold },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 16, fontFamily: fonts.headingSemibold, marginTop: 8 },
  emptyHint: { fontSize: 12, fontFamily: fonts.body, textAlign: 'center' },
  gripHandle: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
