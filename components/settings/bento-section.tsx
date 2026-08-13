import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '@/components/GlassCard';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fonts, radius, spacing } from '@/constants/theme';
import type { LucideIcon } from 'lucide-react-native';

// Mirrors Settings' bento-grid section cards: colored left border-accent
// + circular icon badge + uppercase header, wrapping a stack of rows.
export function BentoSection({
  icon: Icon,
  label,
  accentColor,
  children,
}: {
  icon: LucideIcon;
  label: string;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <GlassCard accentColor={accentColor} style={styles.section}>
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: `${accentColor}26` }]}>
          <Icon size={15} color={accentColor} strokeWidth={2.25} />
        </View>
        <Text style={[styles.label, { color: accentColor }]}>{label}</Text>
      </View>
      <View style={{ gap: spacing.sm }}>{children}</View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: radius.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.headingSemibold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
