import { useRouter } from 'expo-router';
import { RegisterScreen } from '../../screens/RegisterScreen';
import { screenToPath } from '../../utils/routes';

export default function RegisterRoute() {
  const router = useRouter();

  return (
    <RegisterScreen
      navigation={{
        navigate: (screen: string) => router.push(screenToPath(screen)),
        reset: (state: any) => router.replace(screenToPath(state.routes[state.index]?.name ?? 'HomeScreen')),
      }}
    />
  );
}
