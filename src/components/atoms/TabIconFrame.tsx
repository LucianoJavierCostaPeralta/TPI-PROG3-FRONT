import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { AppIcon } from './AppIcon';

type TabIconFrameProps = {
  icon: React.ComponentProps<typeof AppIcon>['name'];
  active?: boolean;
};

export function TabIconFrame({ icon, active = false }: TabIconFrameProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.frame, active && styles.frameActive]}>
      <AppIcon
        name={icon}
        size={18}
        color={active ? theme.colors.textPrimary : theme.colors.textMuted}
      />
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    frame: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    frameActive: {
      backgroundColor: theme.colors.surfaceMuted,
    },
  });
