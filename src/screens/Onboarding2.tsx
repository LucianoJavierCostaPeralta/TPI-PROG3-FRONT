import { OnboardingStep } from '../components/molecules/OnboardingStep';

type Onboarding2Props = {
  navigation?: {
    navigate: (screen: string) => void;
  };
};

export function Onboarding2({ navigation }: Onboarding2Props) {
  return (
    <OnboardingStep
      illustration="🚚"
      title="Rutas optimizadas, resultados eficientes"
      subtitle="Optimiza rutas, monitorea conductores y mejora la eficiencia de tu operación."
      currentStep={2}
      totalSteps={2}
      onNext={() => navigation?.navigate('LoginScreen')}
      buttonText="Comenzar"
    />
  );
}
