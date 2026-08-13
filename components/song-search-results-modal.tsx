import { useThemeColors } from '@/hooks/use-theme-colors';
import type { OnlineSearchResult } from '@/lib/online-search';
import { Loader2, Search, X } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Easing, FlatList, Modal, Pressable, Text, View } from 'react-native';

function Spinner({ color }: { color: string }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Loader2 size={16} color={color} strokeWidth={2} />
    </Animated.View>
  );
}

function ResultRow({ result, onSelect }: { result: OnlineSearchResult; onSelect: () => void }) {
  return (
    <View className="gap-3 rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="flex-shrink font-sora-bold text-base text-foreground" numberOfLines={1}>{result.title}</Text>
            <View className="rounded-full bg-primary/10 px-2.5 py-0.5">
              <Text className="font-sora-semibold text-[10px] text-primary">{result.source}</Text>
            </View>
          </View>
          <Text className="mt-0.5 font-sora text-xs text-muted-foreground" numberOfLines={1}>{result.artist}</Text>
        </View>
        <Pressable onPress={onSelect} className="shrink-0 rounded-full bg-primary px-4 py-1.5">
          <Text className="font-sora-bold text-xs text-primary-foreground">Usar</Text>
        </Pressable>
      </View>
      <View className="rounded-xl border border-border/80 bg-muted/40 p-3">
        <Text className="font-sora text-xs italic leading-relaxed text-muted-foreground" numberOfLines={3}>
          "{result.lyrics.slice(0, 180)}…"
        </Text>
      </View>
    </View>
  );
}

export function SongSearchResultsModal({
  visible,
  loading,
  results,
  currentStage,
  nextStage,
  searchingMore,
  onSelect,
  onSearchMore,
  onClose,
}: {
  visible: boolean;
  loading: boolean;
  results: OnlineSearchResult[];
  currentStage: number;
  nextStage: number | null;
  searchingMore: boolean;
  onSelect: (result: OnlineSearchResult) => void;
  onSearchMore: () => void;
  onClose: () => void;
}) {
  const colors = useThemeColors();
  const nextStageLabel = nextStage === 2 ? 'Buscar más en iTunes / lyrics.ovh' : 'Buscar más fuentes';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/60" onPress={onClose}>
        <Pressable className="max-h-[85%] rounded-t-3xl border-t border-border bg-card" onPress={(e) => e.stopPropagation()}>
          <View className="items-center pb-1 pt-3">
            <View className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
          </View>

          <View className="flex-row items-center justify-between border-b border-border px-5 py-3">
            <Text className="font-sora-bold text-lg text-foreground">Resultados ({results.length})</Text>
            <Pressable onPress={onClose} className="h-8 w-8 items-center justify-center rounded-full bg-muted">
              <X size={16} color={colors.mutedForeground} strokeWidth={2} />
            </Pressable>
          </View>

          {loading ? (
            <View className="items-center gap-2 px-5 py-10">
              <Spinner color={colors.primary} />
              <Text className="font-sora text-xs text-muted-foreground">Buscando la letra…</Text>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item, index) => `${item.title}::${item.artist}::${item.source}::${index}`}
              contentContainerClassName="gap-3.5 p-5"
              ListEmptyComponent={
                <View className="items-center rounded-2xl border border-dashed border-border p-6">
                  <Text className="text-center font-sora-semibold text-sm text-foreground">
                    No se encontraron letras en esta fuente.
                  </Text>
                  <Text className="mt-1 text-center font-sora text-xs text-muted-foreground">
                    Toca el botón de abajo para buscar en la siguiente fuente.
                  </Text>
                </View>
              }
              renderItem={({ item }) => <ResultRow result={item} onSelect={() => onSelect(item)} />}
            />
          )}

          <View className="border-t border-border p-4" style={{ paddingBottom: 24 }}>
            {nextStage !== null ? (
              <Pressable
                onPress={onSearchMore}
                disabled={searchingMore}
                className="flex-row items-center justify-center gap-2 rounded-xl bg-muted py-3"
              >
                {searchingMore ? (
                  <>
                    <Spinner color={colors.primary} />
                    <Text className="font-sora-bold text-xs text-foreground">Buscando en la siguiente fuente…</Text>
                  </>
                ) : (
                  <>
                    <Search size={16} color={colors.primary} strokeWidth={2} />
                    <Text className="font-sora-bold text-xs text-foreground">{nextStageLabel}</Text>
                  </>
                )}
              </Pressable>
            ) : (
              <Text className="text-center font-sora text-xs italic text-muted-foreground">
                Se han consultado todas las fuentes disponibles.
              </Text>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
