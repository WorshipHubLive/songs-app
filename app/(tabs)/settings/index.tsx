import { AmbientGlow } from '@/components/ambient-glow';
import { BentoSection } from '@/components/settings/bento-section';
import { SettingsRow, SettingsTile } from '@/components/settings/settings-row';
import { Card } from '@/components/ui/card';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Stack, useRouter } from 'expo-router';
import { Cloud, Languages, Laptop, Palette, RadioTower, Search, Smartphone, User } from 'lucide-react-native';
import { Image, ScrollView, Text, View } from 'react-native';

// Mirrors Settings.tsx's "menu" subTab: cross-platform promo card, then a
// bento grid of sections (Visuals / Connectivity / Preferences).
export default function SettingsHubScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <AmbientGlow />
      <Stack.Title asChild>
        <Text className="font-sora-bold text-xl text-foreground">Settings</Text>
      </Stack.Title>

      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerClassName="gap-4 p-4 pb-8">
        <Card className="flex-row items-center gap-3">
          <Smartphone size={22} color={colors.primary} />
          <View className="flex-1">
            <Text className="font-sora-semibold text-sm text-foreground">Usa WorshipHub Songs en más dispositivos</Text>
            <Text className="mt-0.5 font-sora text-[11px] text-muted-foreground">
              Sincroniza tu biblioteca entre tu teléfono y la computadora del equipo.
            </Text>
          </View>
        </Card>

        <BentoSection icon={Palette} label="Visuals" accent="primary">
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

        <BentoSection icon={RadioTower} label="Connectivity" accent="secondary">
          <SettingsRow icon={RadioTower} title="WorshipHub" description="No vinculado" />
          <View className="flex-row gap-2">
            <SettingsTile icon={Laptop} title="Local Sync" />
            <SettingsTile icon={Cloud} title="Cloud Sync" />
          </View>
        </BentoSection>

        <BentoSection icon={Search} label="Preferences" accent="accent">
          <SettingsRow icon={Search} title="Search" description="Búsqueda de letras en línea" />
        </BentoSection>

        <View className="items-center gap-2 pt-4">
          <Image source={require('@/assets/brand/WorshipHub_Songs_Icon.png')} className="h-7 w-7 rounded-md opacity-60" resizeMode="contain" />
          <Text className="font-sora text-[11px] text-muted-foreground">WorshipHub Songs · v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
