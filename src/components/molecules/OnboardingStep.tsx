import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SecondaryButton } from '../atoms/SecondaryButton';
import { Title, Subtitle, Body } from '../atoms/Typography';

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
              style={[
                styles.dot,
                index < currentStep && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>

      <SecondaryButton onPress={onNext}>
        {buttonText} →
      </SecondaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 16,
  },
  skipText: {
    color: '#1976D2',
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
    width: 240,
    height: 280,
    borderRadius: 28,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  illustrationText: {
    fontSize: 72,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 320,
    color: '#666666',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e5e7eb',
  },
  dotActive: {
    backgroundColor: '#1976D2',
  },
});
