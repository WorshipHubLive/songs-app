import { Stack } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AmbientGlow } from '@/components/ambient-glow';
import { LANGUAGE_KEY } from '@/consts/keys';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { setKvJson } from '@/utils/kv-store';

// Mirrors Settings' Language subTab: grid of language cards with a
// flag-emoji swatch + name + native label; selected has a primary
// border + trailing checkmark. One entry per resource actually
// registered in i18n/index.ts — adding a language means adding both a
// resources entry there and a LANGUAGES row here.
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
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const selected = i18n.language;

  const selectLanguage = (code: string) => {
    if (code === selected) return;
    void i18n.changeLanguage(code);
    setKvJson(LANGUAGE_KEY, { language: code });
  };

  return (
    <View className="flex-1 bg-background">
      <AmbientGlow />
      <Stack.Title asChild>
        <Text className="font-sora-bold text-xl text-foreground">{t('languageScreen.title')}</Text>
      </Stack.Title>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerClassName="gap-2 p-4">
        {LANGUAGES.map((lang) => {
          const active = selected === lang.code;
          return (
            <Pressable
              key={lang.code}
              onPress={() => selectLanguage(lang.code)}
              className={`flex-row items-center gap-3 rounded-lg bg-card p-3 ${active ? 'border-2 border-primary' : 'border border-border'}`}
            >
              <View className="h-11 w-11 items-center justify-center rounded-md bg-muted">
                <Text className="text-[22px]">{lang.flag}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-sora-semibold text-sm text-foreground">{lang.name}</Text>
                <Text className="mt-px font-sora text-[11px] text-muted-foreground">{lang.native}</Text>
              </View>
              {active && (
                <View className="h-[22px] w-[22px] items-center justify-center rounded-full bg-primary">
                  <Check size={12} color={colors.primaryForeground} strokeWidth={3} />
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
