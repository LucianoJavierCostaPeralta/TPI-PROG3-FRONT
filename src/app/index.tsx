import { useRouter } from 'expo-router';
import { SplashTemplate } from '../components/templates/SplashTemplate';
import { clearSession, getProfile, hasStoredSession } from '../services/api';

export default function IndexRoute() {
  const router = useRouter();

  const handleAnimationComplete = async () => {
    const hasSession = await hasStoredSession();
    if (hasSession) {
      try {
        await getProfile();
        router.replace('/home');
        return;
      } catch {
        await clearSession();
      }
    }

    router.replace('/onboarding1');
  };

  return (
    <SplashTemplate onAnimationComplete={handleAnimationComplete} />
  );
}
