import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  User,
  Palette,
  Languages,
  RadioTower,
  Laptop,
  Cloud,
  Search,
  Smartphone,
} from 'lucide-react-native';
import { AmbientGlow } from '@/components/AmbientGlow';
import { GlassCard } from '@/components/GlassCard';
import { BentoSection } from '@/components/settings/BentoSection';
import { SettingsRow, SettingsTile } from '@/components/settings/SettingsRow';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fonts, spacing } from '@/constants/theme';

// Mirrors Settings.tsx's "menu" subTab: cross-platform promo card, then a
// bento grid of glass-card sections (Visuals / Connectivity / Preferences).
export default function SettingsHubScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <AmbientGlow />
      <Stack.Title large>Settings</Stack.Title>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: spacing.xl,
          gap: spacing.lg,
        }}
      >
        <GlassCard>
          <View style={styles.promoRow}>
            <Smartphone size={22} color={theme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.promoTitle, { color: theme.foreground }]}>
                Usa WorshipHub Songs en más dispositivos
              </Text>
              <Text style={[styles.promoDesc, { color: theme.mutedForeground }]}>
                Sincroniza tu biblioteca entre tu teléfono y la computadora del equipo.
              </Text>
            </View>
          </View>
        </GlassCard>

        <BentoSection icon={Palette} label="Visuals" accentColor={theme.primary}>
          <SettingsRow icon={User} title="Profile Settings" description="Nombre y avatar" />
          <SettingsRow
            icon={Palette}
            title="Appearance"
            description="Tema claro / oscuro"
            onPress={() => router.push('/settings/appearance')}
          />
          <SettingsRow
            icon={Languages}
            title="Idioma"
            description="Idioma de la interfaz"
            onPress={() => router.push('/settings/language')}
          />
        </BentoSection>

        <BentoSection icon={RadioTower} label="Connectivity" accentColor={theme.secondary}>
          <SettingsRow icon={RadioTower} title="WorshipHub" description="No vinculado" />
          <View style={styles.tileRow}>
            <SettingsTile icon={Laptop} title="Local Sync" />
            <SettingsTile icon={Cloud} title="Cloud Sync" />
          </View>
        </BentoSection>

        <BentoSection icon={Search} label="Preferences" accentColor={theme.accent}>
          <SettingsRow icon={Search} title="Search" description="Búsqueda de letras en línea" />
        </BentoSection>

        <View style={styles.footer}>
          <Image
            source={require('@/assets/brand/WorshipHub_Songs_Icon.png')}
            style={styles.footerIcon}
            resizeMode="contain"
          />
          <Text style={[styles.footerText, { color: theme.mutedForeground }]}>
            WorshipHub Songs · v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  promoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  promoTitle: { fontSize: 13, fontFamily: fonts.headingSemibold },
  promoDesc: { fontSize: 11, fontFamily: fonts.body, marginTop: 2 },
  tileRow: { flexDirection: 'row', gap: spacing.sm },
  footer: { alignItems: 'center', gap: 8, paddingTop: spacing.lg },
  footerIcon: { width: 28, height: 28, borderRadius: 6, opacity: 0.6 },
  footerText: { fontSize: 11, fontFamily: fonts.body },
});
