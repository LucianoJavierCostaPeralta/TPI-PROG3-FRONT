import { useRouter } from 'expo-router';
import { Onboarding1 } from '../screens/Onboarding1';
import { screenToPath } from './routes';

export default function Onboarding1Route() {
  const router = useRouter();

  return <Onboarding1 navigation={{ navigate: (screen) => router.push(screenToPath(screen)) }} />;
}
