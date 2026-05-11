import { Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { AppIcon } from '../atoms/AppIcon';
import { SelectField } from '../molecules/SelectField';

type TopBarProps = {
  label: string;
};

export function TopBar({ label }: TopBarProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <SelectField label={label} />
      <TouchableOpacity style={styles.menuButton} activeOpacity={0.8}>
        <AppIcon name="menu" size={30} color="#1f2937" />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: 14,
      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 12,
      paddingBottom: 12,
      backgroundColor: theme.colors.topBar,
    },
    menuButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
