import { useRouter } from "expo-router";
import { LoginScreen } from "../screens/LoginScreen";
import { screenToPath } from "./routes";

export default function LoginRoute() {
  const router = useRouter();

  return (
    <LoginScreen
      navigation={{
        navigate: (screen) => router.push(screenToPath(screen)),
        reset: (state) =>
          router.replace(
            screenToPath(state.routes[state.index]?.name ?? "HomeScreen"),
          ),
      }}
    />
  );
}
