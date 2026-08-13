import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { Check } from 'lucide-react-native';
import { AmbientGlow } from '@/components/AmbientGlow';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fonts, radius, spacing } from '@/constants/theme';

// Mirrors Settings' Language subTab: grid of glass-card language cards
// with a flag-emoji swatch + name + native label; selected has a primary
// border/glow + trailing checkmark. The web app ships 9 languages.
const LANGUAGES = [
  { code: 'es', flag: '🇪🇸', name: 'Español', native: 'Español' },
  { code: 'en', flag: '🇺🇸', name: 'Inglés', native: 'English' },
  { code: 'fr', flag: '🇫🇷', name: 'Francés', native: 'Français' },
  { code: 'ht', flag: '🇭🇹', name: 'Criollo Haitiano', native: 'Kreyòl Ayisyen' },
  { code: 'it', flag: '🇮🇹', name: 'Italiano', native: 'Italiano' },
  { code: 'ko', flag: '🇰🇷', name: 'Coreano', native: '한국어' },
  { code: 'pl', flag: '🇵🇱', name: 'Polaco', native: 'Polski' },
  { code: 'ru', flag: '🇷🇺', name: 'Ruso', native: 'Русский' },
  { code: 'zh', flag: '🇨🇳', name: 'Chino', native: '中文' },
];

export default function LanguageScreen() {
  const { theme } = useAppTheme();
  const [selected, setSelected] = useState('es');

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <AmbientGlow />
      <Stack.Title>Idioma</Stack.Title>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
      >
        {LANGUAGES.map((lang) => {
          const active = selected === lang.code;
          return (
            <Pressable
              key={lang.code}
              onPress={() => setSelected(lang.code)}
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: active ? theme.primary : theme.border,
                  borderWidth: active ? 2 : 1,
                },
              ]}
            >
              <View style={[styles.flagSwatch, { backgroundColor: theme.muted }]}>
                <Text style={styles.flag}>{lang.flag}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: theme.foreground }]}>{lang.name}</Text>
                <Text style={[styles.native, { color: theme.mutedForeground }]}>{lang.native}</Text>
              </View>
              {active && (
                <View style={[styles.checkBadge, { backgroundColor: theme.primary }]}>
                  <Check size={12} color={theme.primaryForeground} strokeWidth={3} />
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  flagSwatch: {
    width: 44,
    height: 44,
    borderRadius: radius.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: { fontSize: 22 },
  name: { fontSize: 14, fontFamily: fonts.headingSemibold },
  native: { fontSize: 11, fontFamily: fonts.body, marginTop: 1 },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
