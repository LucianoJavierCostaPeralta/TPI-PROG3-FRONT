import { useRouter } from 'expo-router';
import { SplashScreen } from '../screens/SplashScreen';
import { screenToPath } from '../utils/routes';

export default function IndexRoute() {
  const router = useRouter();

  return (
    <SplashScreen
      navigation={{
        navigate: (screen) => router.push(screenToPath(screen)),
        reset: (state) => router.replace(screenToPath(state.routes[state.index]?.name ?? 'Onboarding1')),
      }}
    />
  );
}
