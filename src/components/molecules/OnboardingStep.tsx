import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // nuevo: evita botones debajo del home indicator
import { useTheme, type MD3Theme } from 'react-native-paper';
import { CTAButton } from '../atoms/CTAButton';
import { Title, Body } from '../atoms/Typography';
import { spacing } from '../../styles/theme';

type OnboardingStepProps = {
  illustration: string;
  title: string;
  subtitle: string;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onSkip?: () => void;
  buttonText?: string;
};

export function OnboardingStep({
  illustration,
  title,
  subtitle,
  currentStep,
  totalSteps,
  onNext,
  onSkip,
  buttonText = 'Siguiente',
}: OnboardingStepProps) {
  const theme = useTheme<MD3Theme>();
  const insets = useSafeAreaInsets(); // nuevo: safe area inferior real
  const styles = createStyles(theme, insets);

  return (
    <View style={styles.container}>
      {onSkip && (
        <View style={styles.header}>
          <Pressable onPress={onSkip}>
            <Text style={styles.skipText}>Omitir</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.illustration}>
          <Text style={styles.illustrationText}>{illustration}</Text>
        </View>

        <Title style={styles.title}>{title}</Title>
        <Body style={styles.subtitle}>{subtitle}</Body>

        <View style={styles.progressDots}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index < currentStep && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      <CTAButton variant="secondary" onPress={onNext}>
        {buttonText} →
      </CTAButton>
    </View>
  );
}

const createStyles = (theme: MD3Theme, insets: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: spacing.xxl,
      justifyContent: 'space-between',

      // nuevo: evita que el botón quede debajo de la barra del sistema
      paddingBottom: insets.bottom + spacing.xxl,
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingVertical: spacing.lg,
    },

    skipText: {
      color: theme.colors.primary,
      fontSize: 15,
      fontWeight: '600',
    },

    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 28,
    },

    illustration: {
      width: 220,
      height: 240,
      borderRadius: 24,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.onSurface,
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },

    illustrationText: {
      fontSize: 72,
    },

    title: {
      textAlign: 'center',
      maxWidth: 300,
    },

    subtitle: {
      textAlign: 'center',
      maxWidth: 320,
    },

    progressDots: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
    },

    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.outline,
    },

    dotActive: {
      backgroundColor: theme.colors.primary,
    },
  });