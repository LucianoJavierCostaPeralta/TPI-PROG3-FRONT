import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { AppIcon } from '../atoms/AppIcon';

type SelectFieldProps = {
  label: string;
};

export function SelectField({ label }: SelectFieldProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.iconWrap}>
        <AppIcon
          name="chevron-down"
          size={18}
          color={theme.colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      height: theme.sizes.selectHeight,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: {
      fontSize: theme.typography.input.fontSize,
      lineHeight: theme.typography.input.lineHeight,
      fontWeight: theme.typography.input.fontWeight,
      color: theme.colors.textSecondary,
    },
    iconWrap: {
      marginLeft: 12,
    },
  });
