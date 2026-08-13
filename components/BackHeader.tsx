import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fonts, radius, spacing } from '@/constants/theme';

export function BackHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
}) {
  const { theme, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: insets.top + 10,
          backgroundColor: isDark ? 'rgba(6,8,15,0.8)' : 'rgba(246,248,250,0.8)',
          borderBottomColor: theme.border,
        },
      ]}
    >
      <Pressable
        onPress={onBack}
        style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.border }]}
      >
        <ArrowLeft size={17} color={theme.foreground} />
      </Pressable>
      <Text style={[styles.title, { color: theme.foreground }]}>{title}</Text>
      <View style={{ flex: 1 }} />
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 17, fontFamily: fonts.headingSemibold },
});
