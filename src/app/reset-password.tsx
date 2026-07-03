import { useRouter } from 'expo-router';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { screenToPath } from '../utils/routes';

export default function ResetPasswordRoute() {
  const router = useRouter();

  return (
    <ResetPasswordScreen
      navigation={{
        reset: (state) => router.replace(screenToPath(state.routes[state.index]?.name ?? 'LoginScreen')),
      }}
    />
  );
}
