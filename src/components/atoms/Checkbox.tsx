import { StyleSheet, View, TouchableOpacity } from 'react-native';
import {
  Checkbox as PaperCheckbox,
  Text,
  useTheme,
  type MD3Theme,
} from 'react-native-paper';

type CheckboxProps = {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  // Ahora acepta un string normal O un componente de React para textos enriquecidos
  label: string | React.ReactNode; 
  disabled?: boolean;
  style?: any;
};

export function Checkbox({ checked, onToggle, label, disabled, style }: CheckboxProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    // Usamos TouchableOpacity para que toda la fila sea clickeable, no solo el cuadrito
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onToggle(!checked)}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <PaperCheckbox.Android
        status={checked ? 'checked' : 'unchecked'}
        onPress={() => onToggle(!checked)}
        color={theme.colors.primary}
        uncheckedColor={theme.colors.onSurfaceVariant}
        disabled={disabled}
      />
      <View style={styles.labelContainer}>
        {typeof label === 'string' ? (
          <Text style={styles.label}>{label}</Text>
        ) : (
          label
        )}
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 28,
  
    },
    labelContainer: {
      flex: 1, // Permite que el texto baje a la siguiente línea si es muy largo
      marginLeft: 4,
    },
    label: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 14,
      lineHeight: 20,
    },
  });