import { supabase } from '../lib/supabase';
import { SplashTemplate } from '../components/templates/SplashTemplate';

type SplashScreenProps = {
  navigation?: {
    navigate: (screen: string) => void;
    reset: (state: { index: number; routes: Array<{ name: string }> }) => void;
  };
};

export function SplashScreen({ navigation }: SplashScreenProps) {
  const handleAnimationComplete = async () => {
    const { data } = await supabase.auth.getSession();

    navigation?.reset({
      index: 0,
      routes: [{ name: data.session ? 'HomeScreen' : 'Onboarding1' }],
    });
  };

  return (
    <SplashTemplate onAnimationComplete={handleAnimationComplete} />
  );
}
