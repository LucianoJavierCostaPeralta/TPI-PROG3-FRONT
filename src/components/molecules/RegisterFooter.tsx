import { StyleSheet, View } from 'react-native';
import { useTheme, type MD3Theme } from 'react-native-paper';
import { CTAButton } from '../atoms/CTAButton';
import { Body, Caption } from '../atoms/Typography';
import { cardStyles, spacing } from '../../styles/theme';

type RegisterFooterProps = {
  onConsultWithAdvisor: () => void;
};

export function RegisterFooter({ onConsultWithAdvisor }: RegisterFooterProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Body style={styles.question}>¿Listo para empezar a gestionar tu logística?</Body>
      <Caption style={styles.description}>
        Crea tu cuenta para comenzar a administrar viajes, flotas y operaciones
        desde la plataforma.
      </Caption>

      <CTAButton variant="secondary" onPress={onConsultWithAdvisor}>
        Crear mi cuenta
      </CTAButton>
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      ...cardStyles.base,
      paddingVertical: 22,
      paddingHorizontal: 18,
      backgroundColor: theme.colors.surfaceVariant,
      borderColor: theme.colors.outline,
    },
    question: {
      color: theme.colors.onSurface,
      marginBottom: spacing.sm,
    },
    description: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: spacing.lg,
    },
  });
