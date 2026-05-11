import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { TabIconFrame } from '../atoms/TabIconFrame';

type BottomTabItemProps = {
  label: string;
  icon: React.ComponentProps<typeof TabIconFrame>['icon'];
  active?: boolean;
  onPress?: () => void;
};

export function BottomTabItem({
  label,
  icon,
  active = false,
  onPress,
}: BottomTabItemProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPress}>
      <TabIconFrame icon={icon} active={active} />
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      minHeight: 56,
    },
    label: {
      fontSize: theme.typography.tabLabel.fontSize,
      lineHeight: theme.typography.tabLabel.lineHeight,
      fontWeight: theme.typography.tabLabel.fontWeight,
      color: theme.colors.textMuted,
      letterSpacing: 0.2,
    },
    labelActive: {
      color: theme.colors.textPrimary,
    },
  });
