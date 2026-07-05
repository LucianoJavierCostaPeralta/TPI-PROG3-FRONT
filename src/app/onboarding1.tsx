import { useRouter } from 'expo-router';
import { OnboardingStep } from '../components/molecules/OnboardingStep';

export default function Onboarding1Route() {
  const router = useRouter();

  return (
    <OnboardingStep
      illustration="📋✓"
      title="Gestión de entregas inteligente"
      subtitle="Organiza, asigna y realiza seguimiento de todas tus entregas en tiempo real."
      currentStep={1}
      totalSteps={2}
      onNext={() => router.push('/onboarding2')}
      onSkip={() => router.replace('/login')}
      buttonText="Siguiente"
    />
  );
}
