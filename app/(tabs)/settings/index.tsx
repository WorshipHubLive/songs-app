import { Stack, useRouter } from 'expo-router';
import { Cloud, Languages, Laptop, Palette, RadioTower, Search, Smartphone, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, Text, View } from 'react-native';
import { AmbientGlow } from '@/components/ambient-glow';
import { BentoSection } from '@/components/settings/bento-section';
import { SettingsRow, SettingsTile } from '@/components/settings/settings-row';
import { Card } from '@/components/ui/card';
import { useAppSettings } from '@/hooks/use-app-settings';
import { useThemeColors } from '@/hooks/use-theme-colors';

// Mirrors Settings.tsx's "menu" subTab: cross-platform promo card, then a
// bento grid of sections (Visuals / Connectivity / Preferences).
export default function SettingsHubScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { settings } = useAppSettings();

  return (
    <View className="flex-1 bg-background">
      <AmbientGlow />
      <Stack.Title asChild>
        <Text className="font-sora-bold text-xl text-foreground">{t('settingsHub.title')}</Text>
      </Stack.Title>

      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerClassName="gap-4 p-4 pb-8">
        <Card className="flex-row items-center gap-3">
          <Smartphone size={22} color={colors.primary} />
          <View className="flex-1">
            <Text className="font-sora-semibold text-sm text-foreground">{t('settingsHub.promoTitle')}</Text>
            <Text className="mt-0.5 font-sora text-[11px] text-muted-foreground">{t('settingsHub.promoDescription')}</Text>
          </View>
        </Card>

        <BentoSection icon={Palette} label={t('settingsHub.sectionVisuals')} accent="primary">
          <SettingsRow
            icon={User}
            title={t('settingsHub.rowProfile')}
            description={settings.profile.name || t('settingsHub.rowProfileDescriptionFallback')}
            onPress={() => router.push('/settings/profile')}
          />
          <SettingsRow
            icon={Palette}
            title={t('settingsHub.rowAppearance')}
            description={t('settingsHub.rowAppearanceDescription')}
            onPress={() => router.push('/settings/appearance')}
          />
          <SettingsRow
            icon={Languages}
            title={t('settingsHub.rowLanguage')}
            description={t('settingsHub.rowLanguageDescription')}
            onPress={() => router.push('/settings/language')}
          />
        </BentoSection>

        <BentoSection icon={RadioTower} label={t('settingsHub.sectionConnectivity')} accent="secondary">
          <SettingsRow
            icon={RadioTower}
            title={t('settingsHub.rowWorshiphub')}
            description={
              settings.worshiphub.linked ? t('settingsHub.rowWorshiphubLinked') : t('settingsHub.rowWorshiphubNotLinked')
            }
            onPress={() => router.push('/settings/worshiphub')}
          />
          <View className="flex-row gap-2">
            <SettingsTile
              icon={Laptop}
              title={t('settingsHub.rowLocalSync')}
              onPress={() => router.push('/settings/local-sync')}
            />
            <SettingsTile
              icon={Cloud}
              title={t('settingsHub.rowCloudSync')}
              onPress={() => router.push('/settings/cloud-sync')}
            />
          </View>
        </BentoSection>

        <BentoSection icon={Search} label={t('settingsHub.sectionPreferences')} accent="accent">
          <SettingsRow
            icon={Search}
            title={t('settingsHub.rowSearch')}
            description={
              settings.search.tavilyApiKey ? t('settingsHub.rowSearchAdvancedActive') : t('settingsHub.rowSearchOnlineLyrics')
            }
            onPress={() => router.push('/settings/search')}
          />
        </BentoSection>

        <View className="items-center gap-2 pt-4">
          <Image
            source={require('@/assets/brand/WorshipHub_Songs_Icon.png')}
            className="h-7 w-7 rounded-md opacity-60"
            resizeMode="contain"
          />
          <Text className="font-sora text-[11px] text-muted-foreground">{t('settingsHub.footer', { version: '1.0.0' })}</Text>
        </View>
      </ScrollView>
    </View>
  );
}
