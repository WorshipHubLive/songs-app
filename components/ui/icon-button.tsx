import type { LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';

type IconButtonProps = {
  icon: LucideIcon;
  color: string;
  size?: number;
  /** Extra classes merged onto the button's own defaults. */
  className?: string;
  onPress?: () => void;
};

// Small circular icon-only tap target, reused by SongCard's footer
// actions and anywhere else that needs the same "icon in a rounded box"
// shape instead of redrawing it per screen.
export function IconButton({ icon: Icon, color, size = 15, className = '', onPress }: IconButtonProps) {
  return (
    <Pressable onPress={onPress} className={`h-[30px] w-[30px] items-center justify-center rounded-sm ${className}`}>
      <Icon size={size} color={color} strokeWidth={2} />
    </Pressable>
  );
}
