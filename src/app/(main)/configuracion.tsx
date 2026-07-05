import { useRouter } from 'expo-router';
import { ConfiguracionScreen } from '../../screens/ConfiguracionScreen';

export default function ConfiguracionRoute() {
  const router = useRouter();

  return <ConfiguracionScreen onBack={() => router.back()} />;
}
