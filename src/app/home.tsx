import { useRouter } from 'expo-router';
import { HomeScreen } from '../screens/HomeScreen';
import { screenToPath } from '../utils/routes';

export default function HomeRoute() {
  const router = useRouter();

  return (
    <HomeScreen
      navigation={{
        reset: (state) => router.replace(screenToPath(state.routes[state.index]?.name ?? 'LoginScreen')),
      }}
    />
  );
}
