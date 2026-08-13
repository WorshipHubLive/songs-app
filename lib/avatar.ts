import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

// Downscales a picked avatar to a small JPEG data URL before sending it
// to WorshipHub — same shape as the web/desktop apps' own
// `shrinkAvatarForTransfer` (standalone/songs and standalone/note's
// src/lib/api.ts): a 64px thumbnail, JPEG quality 0.7. The pairing and
// "content received" toasts only ever render this at 40px, so a 64px
// source is plenty. Width-only resize (not width+height like the web
// version's `Math.min` against the larger dimension) is fine here since
// the picker always forces a square crop (see settings/profile.tsx).
export async function shrinkAvatarForTransfer(uri: string): Promise<string> {
  if (!uri) return '';
  try {
    const result = await manipulateAsync(uri, [{ resize: { width: 64 } }], {
      compress: 0.7,
      format: SaveFormat.JPEG,
      base64: true,
    });
    if (!result.base64) return '';
    return `data:image/jpeg;base64,${result.base64}`;
  } catch {
    return '';
  }
}
