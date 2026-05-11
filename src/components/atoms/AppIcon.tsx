import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '../../hooks/useAppTheme';

type AppIconProps = {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
  color?: string;
};

export function AppIcon({
  name,
  size = 22,
  color,
}: AppIconProps) {
  const theme = useAppTheme();

  return (
    <Ionicons
      name={name}
      size={size}
      color={color ?? theme.colors.textPrimary}
    />
  );
}
