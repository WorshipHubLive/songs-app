import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '@/hooks/useAppTheme';
import { radius } from '@/constants/theme';

// Mirrors the web app's `.glass-card`: dark mode is a translucent blurred
// gradient panel (`linear-gradient(145deg, rgba(39,42,50,.4), rgba(25,27,35,.2))`,
// blur(24px), faint white border); light mode is just a solid white card
// with a soft border (the web CSS overrides glass-card to solid white in
// light mode too — glassmorphism is a dark-theme effect there).
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

  const content = (
    <View
      style={[
        styles.inner,
        {
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
          borderLeftColor: accentColor,
          borderLeftWidth: accentColor ? 3 : StyleSheet.hairlineWidth,
          backgroundColor: isDark ? 'transparent' : theme.card,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!isDark) {
    return content;
  }

  return (
    <BlurView intensity={40} tint="dark" style={[styles.blurWrap, style]}>
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
  blurWrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  inner: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
  },
});
