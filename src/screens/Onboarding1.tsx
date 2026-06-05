import { OnboardingStep } from '../components/molecules/OnboardingStep';

type Onboarding1Props = {
  navigation?: {
    navigate: (screen: string) => void;
  };
};

export function Onboarding1({ navigation }: Onboarding1Props) {
  return (
    <OnboardingStep
      illustration="📋✓"
      title="Gestión de entregas inteligente"
      subtitle="Organiza, asigna y realiza seguimiento de todas tus entregas en tiempo real."
      currentStep={1}
      totalSteps={2}
      onNext={() => navigation?.navigate('Onboarding2')}
      onSkip={() => navigation?.navigate('LoginScreen')}
      buttonText="Siguiente"
    />
  );
}
