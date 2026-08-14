import { Stack } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AmbientGlow } from '@/components/ambient-glow';
import { type AppThemeMode, useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColors } from '@/hooks/use-theme-colors';

// Mirrors Settings' Appearance subTab: a 2-col grid of theme swatch
// cards (only 2 themes exist), each a color-preview rect + dot + label,
// selected gets a primary ring. The swatch itself must show the OTHER
// theme's colors even while it isn't active, so these stay literal hex —
// they can't come from the live CSS tokens (see global.css), which only
// ever reflect whichever theme is currently applied.
const THEMES: Array<{ mode: AppThemeMode; labelKey: string; bg: string; border: string; dot: string }> = [
  { mode: 'dark', labelKey: 'appearanceScreen.darkThemeLabel', bg: '#11131b', border: '#40484f', dot: '#8ecdff' },
  { mode: 'light', labelKey: 'appearanceScreen.lightThemeLabel', bg: '#f6f8fa', border: '#e2e8f0', dot: '#35a784' },
];

export default function AppearanceScreen() {
  const { mode, setMode } = useAppTheme();
  const colors = useThemeColors();
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-background">
      <AmbientGlow />
      <Stack.Title asChild>
        <Text className="font-sora-bold text-xl text-foreground">{t('appearanceScreen.title')}</Text>
      </Stack.Title>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerClassName="flex-row flex-wrap gap-3 p-4">
        {THEMES.map((theme) => {
          const active = mode === theme.mode;
          return (
            <Pressable
              key={theme.mode}
              onPress={() => setMode(theme.mode)}
              className={`w-[47%] gap-2 rounded-md bg-card p-2 ${active ? 'border-2 border-primary' : 'border border-border'}`}
            >
              <View
                className="h-16 items-center justify-center rounded-[10px] border"
                style={{ backgroundColor: theme.bg, borderColor: theme.border }}
              >
                <View className="h-[18px] w-[18px] rounded-full" style={{ backgroundColor: theme.dot }} />
              </View>
              <View className="flex-row items-center justify-between gap-1.5">
                <Text className="flex-1 font-sora-semibold text-xs text-foreground" numberOfLines={2}>
                  {t(theme.labelKey)}
                </Text>
                {active && (
                  <View className="h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check size={12} color={colors.primaryForeground} strokeWidth={3} />
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
