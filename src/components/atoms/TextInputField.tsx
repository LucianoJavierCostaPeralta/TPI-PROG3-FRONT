import { StyleSheet, View } from 'react-native';
import {
  HelperText,
  TextInput,
  useTheme,
  type MD3Theme,
  type TextInputProps,
} from 'react-native-paper';
import { spacing } from '../../styles/theme';

type TextInputFieldProps = Omit<TextInputProps, 'error' | 'mode'> & {
  error?: string;
};

export function TextInputField({
  error,
  style,
  outlineStyle,
  ...props
}: TextInputFieldProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        error={hasError}
        style={[styles.input, style]}
        outlineStyle={[styles.outline, outlineStyle]}
        outlineColor={theme.colors.outline}
        activeOutlineColor={theme.colors.primary}
        placeholderTextColor={theme.colors.outline}
        {...props}
      />
      <HelperText type="error" visible={hasError} style={styles.error}>
        {error}
      </HelperText>
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.sm,
    },
    input: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    outline: {
      borderRadius: 12,
      borderWidth: 1.5,
    },
    error: {
      marginTop: 0,
      paddingHorizontal: 0,
    },
  });
