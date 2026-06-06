import { StyleSheet, View } from 'react-native';
import {
  Checkbox as PaperCheckbox,
  useTheme,
  type CheckboxItemProps,
  type MD3Theme,
} from 'react-native-paper';
import { cardStyles } from '../../styles/theme';

type CheckboxProps = Omit<CheckboxItemProps, 'status' | 'onPress' | 'label'> & {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  label: string;
};

export function Checkbox({ checked, onToggle, label, style, labelStyle, ...props }: CheckboxProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      <PaperCheckbox.Item
        status={checked ? 'checked' : 'unchecked'}
        onPress={() => onToggle(!checked)}
        label={label}
        labelStyle={[styles.label, labelStyle]}
        color={theme.colors.primary}
        uncheckedColor={theme.colors.primary}
        position="leading"
        mode="android"
        style={styles.item}
        {...props}
      />
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      ...cardStyles.elevated,
      marginBottom: 28,
      backgroundColor: theme.colors.surfaceVariant,
      borderColor: theme.colors.outline,
      padding: 0,
    },
    item: {
      paddingVertical: 2,
      paddingHorizontal: 2,
    },
    label: {
      color: theme.colors.onSurface,
      fontSize: 14,
      lineHeight: 20,
    },
  });
