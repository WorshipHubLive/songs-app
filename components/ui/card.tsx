import type { ReactNode } from 'react';
import { View } from 'react-native';

type CardProps = {
  children: ReactNode;
  /** Extra classes merged onto the card's own defaults. */
  className?: string;
  /** Tailwind border-left color class, e.g. "border-l-primary". */
  accentClassName?: string;
};

// Shared surface used for every card-like block (SongCard, Settings'
// bento sections and rows). Solid `bg-card`, not a blur/glass effect —
// wrapping every card in a Liquid Glass material washed brand colors out
// to gray (system vibrancy applies to children), so glass here is
// reserved for real native chrome (NativeTabs, Stack.Toolbar) instead.
export function Card({ children, className = '', accentClassName }: CardProps) {
  return (
    <View
      className={`rounded-md border border-border bg-card p-5 ${
        accentClassName ? `border-l-[3px] ${accentClassName}` : ''
      } ${className}`}
    >
      {children}
    </View>
  );
}
