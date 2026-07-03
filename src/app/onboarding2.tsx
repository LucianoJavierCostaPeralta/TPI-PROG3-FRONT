import { useRouter } from 'expo-router';
import { Onboarding2 } from '../screens/Onboarding2';
import { screenToPath } from '../utils/routes';

export default function Onboarding2Route() {
  const router = useRouter();

  return <Onboarding2 navigation={{ navigate: (screen) => router.push(screenToPath(screen)) }} />;
}
