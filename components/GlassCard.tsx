import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '@/hooks/useAppTheme';
import { radius } from '@/constants/theme';

// Mirrors the web app's `.glass-card` (a CSS backdrop-blur panel) via
// expo-blur, not expo-glass-effect: real Liquid Glass (GlassView) is a
// *system control material* meant for floating chrome — Apple's own HIG
// reserves it for toolbars/tab bars/buttons, not stacked content cards.
// Wrapping every SongCard in GlassView applies system vibrancy to its
// children, which washed our brand colors out to gray against this dark
// background — visually broken and off-brand. Liquid Glass lives where
// it actually belongs in this app: the native tab bar (NativeTabs) and
// toolbars (Stack.Toolbar/Stack.SearchBar), both real system materials,
// not simulated here. Light mode is just a solid card (the web CSS
// overrides glass-card to solid white in light mode too — glassmorphism
// is a dark-theme effect there).
export function GlassCard({
  children,
  style,
  accentColor,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Left accent border color, e.g. SongCard's cycling primary/secondary/accent. */
  accentColor?: string;
}) {
  const { isDark, theme } = useAppTheme();

  const innerStyle = [
    styles.inner,
    {
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
      borderLeftColor: accentColor,
      borderLeftWidth: accentColor ? 3 : StyleSheet.hairlineWidth,
      backgroundColor: isDark ? 'transparent' : theme.card,
    },
    style,
  ];

  if (!isDark) {
    return <View style={innerStyle}>{children}</View>;
  }

  return (
    <BlurView intensity={40} tint="dark" style={[styles.glassWrap, style]}>
      <View
        style={[
          styles.inner,
          {
            borderColor: 'rgba(255,255,255,0.06)',
            borderLeftColor: accentColor,
            borderLeftWidth: accentColor ? 3 : StyleSheet.hairlineWidth,
            backgroundColor: 'rgba(31,33,42,0.35)',
          },
        ]}
      >
        {children}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  glassWrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  inner: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
  },
});
