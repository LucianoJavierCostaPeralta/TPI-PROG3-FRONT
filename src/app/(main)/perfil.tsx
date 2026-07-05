import { useRouter, useLocalSearchParams } from 'expo-router';
import { PerfilScreen } from '../../screens/PerfilScreen';

export default function PerfilRoute() {
  const router = useRouter();
  const { fromTab } = useLocalSearchParams<{ fromTab?: string }>();

  return (
    <PerfilScreen
      onBack={() => router.replace({ pathname: '/home', params: { openDrawer: 'true', activeTab: fromTab } })}
      onEdit={() => router.push({ pathname: '/editar-perfil', params: { fromTab } })}
    />
  );
}
