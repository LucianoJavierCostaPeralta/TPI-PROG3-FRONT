import { useRouter } from 'expo-router';
import { ResetPasswordScreen } from '../../screens/ResetPasswordScreen';
import { screenToPath } from '../../utils/routes';

export default function ResetPasswordRoute() {
  const router = useRouter();

  return (
    <ResetPasswordScreen
      navigation={{
        reset: (state: any) => router.replace(screenToPath(state.routes[state.index]?.name ?? 'LoginScreen')),
      }}
    />
  );
}
