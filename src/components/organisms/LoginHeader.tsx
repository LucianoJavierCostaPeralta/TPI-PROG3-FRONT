import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, type MD3Theme } from 'react-native-paper';
import { spacing, typography } from '../../styles/theme';

type LoginHeaderProps = {
  onForgotPassword: () => void;
};

export function LoginHeader({ onForgotPassword }: LoginHeaderProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          El sistema identificará automáticamente si accede como empresa o chofer
        </Text>
      </View>

      <Pressable onPress={onForgotPassword} style={styles.forgotButton}>
        <Text style={styles.forgotText}>Olvidé mi contraseña</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.xl,
    },
    notice: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      paddingVertical: spacing.md,
      paddingHorizontal: 14,
      marginBottom: 14,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.outline,
    },
    noticeText: {
      ...typography.labelSm,
      color: theme.colors.onSurfaceVariant,
      letterSpacing: 0.1,
      fontWeight: '500',
    },
    forgotButton: {
      alignSelf: 'flex-end',
      paddingVertical: spacing.sm,
    },
    forgotText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '700',
    },
  });
