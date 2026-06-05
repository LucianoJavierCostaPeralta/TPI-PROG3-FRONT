import { SplashTemplate } from '../components/templates/SplashTemplate';

type SplashScreenProps = {
  navigation?: {
    navigate: (screen: string) => void;
  };
};

export function SplashScreen({ navigation }: SplashScreenProps) {
  const handleAnimationComplete = () => {
    if (navigation?.navigate) {
      navigation.navigate('Onboarding1');
    }
  };

  return (
    <SplashTemplate onAnimationComplete={handleAnimationComplete} />
  );
}
