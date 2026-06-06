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
      <Body style={styles.question}>¿No tienes una cuenta?</Body>
      <Caption style={styles.description}>
        Si su empresa no está registrada, un asesor puede ayudarle a crear y
        configurar su cuenta.
      </Caption>

      <CTAButton variant="secondary" onPress={onConsultWithAdvisor}>
        Consultar con un asesor
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
