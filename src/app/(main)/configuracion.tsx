import { useRouter, useLocalSearchParams } from 'expo-router';
import { ConfiguracionScreen } from '../../screens/ConfiguracionScreen';

export default function ConfiguracionRoute() {
  const router = useRouter();
  const { fromTab } = useLocalSearchParams<{ fromTab?: string }>();

  return (
    <ConfiguracionScreen
      onBack={() => router.replace({ pathname: '/home', params: { openDrawer: 'true', activeTab: fromTab } })}
    />
  );
}
