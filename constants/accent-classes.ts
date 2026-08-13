// The 3 accent tints used throughout the app (SongCard's left border,
// Settings' bento sections, ...). Written as whole literal className
// strings — not built via template interpolation — so Tailwind's static
// scanner can actually see and generate them.
export type AccentName = 'primary' | 'secondary' | 'accent';

export const ACCENT_CLASSES: Record<AccentName, { border: string; text: string; tint: string }> = {
  primary: { border: 'border-l-primary', text: 'text-primary', tint: 'bg-primary/15' },
  secondary: { border: 'border-l-secondary', text: 'text-secondary', tint: 'bg-secondary/15' },
  accent: { border: 'border-l-accent', text: 'text-accent', tint: 'bg-accent/15' },
};

const ACCENT_CYCLE: AccentName[] = ['primary', 'secondary', 'accent'];

/** SongCard's left-border accent cycles through the 3 tints by `song.id % 3`. */
export function accentClasses(index: number) {
  return ACCENT_CLASSES[ACCENT_CYCLE[index % ACCENT_CYCLE.length]];
}
