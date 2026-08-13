import { View } from 'react-native';

// Mirrors the web shell's two large blurred "Liquid Glass 2026" ambient
// blobs (bg-primary/5 top-left, bg-secondary/5 bottom-right). RN has no
// CSS blur-filter on plain Views, so these are just large, very-low-
// opacity soft circles — close enough to read as ambient glow without an
// actual blur pass.
export function AmbientGlow() {
  return (
    <View pointerEvents="none" className="absolute inset-0">
      <View className="absolute -left-36 -top-32 h-[420px] w-[420px] rounded-full bg-primary/[0.06]" />
      <View className="absolute -bottom-32 -right-36 h-[420px] w-[420px] rounded-full bg-secondary/[0.06]" />
    </View>
  );
}
