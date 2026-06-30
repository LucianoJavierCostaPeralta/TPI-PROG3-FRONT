import { StyleSheet, View } from 'react-native';
import {
  HelperText,
  TextInput,
  useTheme,
  type MD3Theme,
  type TextInputProps,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { inputStyles, spacing } from '../../styles/theme';

type TextInputFieldProps = Omit<TextInputProps, 'error' | 'mode'> & {
  error?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
};

export function TextInputField({
  error,
  style,
  outlineStyle,
  icon,
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
        placeholderTextColor={theme.colors.onSurfaceVariant}
        textColor={theme.colors.onSurface}
        dense
        {...props}
        left={
          icon ? (
            <TextInput.Icon
              icon={() => (
                <MaterialCommunityIcons name={icon} size={20} color={theme.colors.onSurfaceVariant} />
              )}
            />
          ) : undefined
        }
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
      minHeight: inputStyles.height,
      backgroundColor: theme.colors.surface,
    },
    outline: {
      borderRadius: inputStyles.borderRadius,
      borderWidth: inputStyles.borderWidth,
    },
    error: {
      marginTop: 0,
      paddingHorizontal: 0,
      color: theme.colors.error,
    },
  });
