import { useRouter } from 'expo-router';
import { RegisterScreen } from '../screens/RegisterScreen';
import { screenToPath } from '../utils/routes';

export default function RegisterRoute() {
  const router = useRouter();

  return (
    <RegisterScreen
      navigation={{
        navigate: (screen) => router.push(screenToPath(screen)),
        reset: (state) => router.replace(screenToPath(state.routes[state.index]?.name ?? 'HomeScreen')),
      }}
    />
  );
}
