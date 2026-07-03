import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, type MD3Theme } from 'react-native-paper';
import { spacing, typography } from '../../styles/theme';

type LoginHeaderProps = {
  onForgotPassword?: () => void;
};

export function LoginHeader(_: LoginHeaderProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          El sistema identificará automáticamente si accede como empresa o chofer
        </Text>
      </View>

      {/* El enlace de 'Olvidé mi contraseña' se muestra ahora dentro del formulario de login */}
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
    // Nota: estilos de 'forgot' movidos al formulario
  });
