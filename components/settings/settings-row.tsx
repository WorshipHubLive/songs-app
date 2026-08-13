import { useThemeColors } from '@/hooks/use-theme-colors';
import { ChevronRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

// Mirrors `.glass-button` settings rows: icon left, title+desc, chevron
// right. Used for full-width rows (Profile, Appearance, Idioma, WorshipHub).
export function SettingsRow({
  icon: Icon,
  title,
  description,
  onPress,
  trailing,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  onPress?: () => void;
  trailing?: ReactNode;
}) {
  const colors = useThemeColors();
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 rounded-md border border-border bg-card px-3.5 py-3">
      <View className="h-[34px] w-[34px] items-center justify-center rounded-sm bg-muted">
        <Icon size={16} color={colors.foreground} strokeWidth={2} />
      </View>
      <View className="flex-1">
        <Text className="font-sora-semibold text-sm text-foreground">{title}</Text>
        {description ? (
          <Text className="mt-px font-sora text-[11px] text-muted-foreground" numberOfLines={1}>
            {description}
          </Text>
        ) : null}
      </View>
      {trailing ?? <ChevronRight size={16} color={colors.mutedForeground} />}
    </Pressable>
  );
}

// Icon-over-label style used for the 2-col Local Sync / Cloud Sync grid.
export function SettingsTile({ icon: Icon, title, onPress }: { icon: LucideIcon; title: string; onPress?: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable onPress={onPress} className="flex-1 items-center justify-center gap-2 rounded-md border border-border bg-card py-[18px]">
      <Icon size={20} color={colors.foreground} strokeWidth={1.75} />
      <Text className="font-sora-semibold text-xs text-foreground">{title}</Text>
    </Pressable>
  );
}
