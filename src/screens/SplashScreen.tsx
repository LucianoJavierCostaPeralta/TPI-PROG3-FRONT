import { SplashTemplate } from '../components/templates/SplashTemplate';
import { clearSession, getProfile, hasStoredSession } from '../services/api';

type SplashScreenProps = {
  navigation?: {
    navigate: (screen: string) => void;
    reset: (state: { index: number; routes: Array<{ name: string }> }) => void;
  };
};

export function SplashScreen({ navigation }: SplashScreenProps) {
  const handleAnimationComplete = async () => {
    const hasSession = await hasStoredSession();
    if (hasSession) {
      try {
        await getProfile();
        navigation?.reset({ index: 0, routes: [{ name: 'HomeScreen' }] });
        return;
      } catch {
        await clearSession();
      }
    }

    navigation?.reset({
      index: 0,
      routes: [{ name: 'Onboarding1' }],
    });
  };

  return (
    <SplashTemplate onAnimationComplete={handleAnimationComplete} />
  );
}
