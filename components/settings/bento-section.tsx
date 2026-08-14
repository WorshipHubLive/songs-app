import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Card } from '@/components/ui/card';
import { ACCENT_CLASSES, type AccentName } from '@/constants/accent-classes';
import { useThemeColors } from '@/hooks/use-theme-colors';

// Mirrors Settings' bento-grid section cards: colored left border-accent
// + circular icon badge + uppercase header, wrapping a stack of rows.
export function BentoSection({
  icon: Icon,
  label,
  accent,
  children,
}: {
  icon: LucideIcon;
  label: string;
  accent: AccentName;
  children: ReactNode;
}) {
  const colors = useThemeColors();
  const { border, text, tint } = ACCENT_CLASSES[accent];
  const iconColor = { primary: colors.primary, secondary: colors.secondary, accent: colors.accent }[accent];

  return (
    <Card accentClassName={border} className="gap-3">
      <View className="flex-row items-center gap-2.5">
        <View className={`h-[30px] w-[30px] items-center justify-center rounded-sm ${tint}`}>
          <Icon size={15} color={iconColor} strokeWidth={2.25} />
        </View>
        <Text className={`font-sora-semibold text-[11px] uppercase tracking-wide ${text}`}>{label}</Text>
      </View>
      <View className="gap-2">{children}</View>
    </Card>
  );
}
