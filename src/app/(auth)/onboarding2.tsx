import { useRouter } from 'expo-router';
import { OnboardingStep } from '../../components/molecules/OnboardingStep';

export default function Onboarding2Route() {
  const router = useRouter();

  return (
    <OnboardingStep
      illustration="🚚"
      title="Rutas optimizadas, resultados eficientes"
      subtitle="Optimiza rutas, monitorea conductores y mejora la eficiencia de tu operación."
      currentStep={2}
      totalSteps={2}
      onNext={() => router.replace('/login')}
      buttonText="Comenzar"
    />
  );
}
