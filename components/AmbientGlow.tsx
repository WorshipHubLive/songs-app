import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

// Mirrors the web shell's two large blurred "Liquid Glass 2026" ambient
// blobs (bg-primary/5 top-left, bg-secondary/5 bottom-right, blur-[120–150px]).
// RN has no CSS blur-filter on plain Views, so these are just large,
// very-low-opacity soft circles — close enough to read as ambient glow
// without needing an actual blur pass.
export function AmbientGlow() {
  const { theme } = useAppTheme();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={[
          styles.blob,
          styles.topLeft,
          { backgroundColor: theme.primary, opacity: 0.06 },
        ]}
      />
      <View
        style={[
          styles.blob,
          styles.bottomRight,
          { backgroundColor: theme.secondary, opacity: 0.06 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
  },
  topLeft: {
    top: -120,
    left: -140,
  },
  bottomRight: {
    bottom: -120,
    right: -140,
  },
});
