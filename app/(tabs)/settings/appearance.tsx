import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { Check } from 'lucide-react-native';
import { AmbientGlow } from '@/components/AmbientGlow';
import { DarkTheme, LightTheme, fonts, radius, spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

// Mirrors Settings' Appearance subTab: a 2-col grid of theme swatch
// cards (only 2 themes exist), each a color-preview rect + dot + label,
// selected gets a primary ring.
const THEMES = [
  { id: 'worshiphub-dark' as const, label: 'WorshipHub Songs Dark Theme', tokens: DarkTheme },
  { id: 'worshiphub-light' as const, label: 'WorshipHub Songs Light Theme', tokens: LightTheme },
];

export default function AppearanceScreen() {
  const { theme, mode, setMode } = useAppTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <AmbientGlow />
      <Stack.Title>Appearance</Stack.Title>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.grid}>
        {THEMES.map((t) => {
          const active = mode === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => setMode(t.id)}
              style={[
                styles.card,
                {
                  borderColor: active ? theme.primary : theme.border,
                  borderWidth: active ? 2 : 1,
                  backgroundColor: theme.card,
                },
              ]}
            >
              <View
                style={[
                  styles.preview,
                  { backgroundColor: t.tokens.swatchBg, borderColor: t.tokens.swatchBorder },
                ]}
              >
                <View style={[styles.previewDot, { backgroundColor: t.tokens.swatchDot }]} />
              </View>
              <View style={styles.cardFooter}>
                <Text style={[styles.cardLabel, { color: theme.foreground }]} numberOfLines={2}>
                  {t.label}
                </Text>
                {active && (
                  <View style={[styles.checkBadge, { backgroundColor: theme.primary }]}>
                    <Check size={12} color={theme.primaryForeground} strokeWidth={3} />
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    padding: spacing.lg,
  },
  card: {
    width: '47%',
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  preview: {
    height: 64,
    borderRadius: radius.sm + 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewDot: { width: 18, height: 18, borderRadius: 9 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  cardLabel: { flex: 1, fontSize: 12, fontFamily: fonts.headingSemibold },
  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
