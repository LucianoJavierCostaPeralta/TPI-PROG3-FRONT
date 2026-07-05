import { useRouter } from "expo-router";
import { LoginScreen } from "../../screens/LoginScreen";
import { screenToPath } from '../../utils/routes';

export default function LoginRoute() {
  const router = useRouter();

  return (
    <LoginScreen
      navigation={{
        navigate: (screen: string) => router.push(screenToPath(screen)),
        reset: (state: any) =>
          router.replace(
            screenToPath(state.routes[state.index]?.name ?? "HomeScreen"),
          ),
      }}
    />
  );
}
