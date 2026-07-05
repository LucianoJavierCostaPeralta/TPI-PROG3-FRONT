import { useRouter, useLocalSearchParams } from 'expo-router';
import { LegalScreen } from '../../screens/LegalScreen';

export default function LegalRoute() {
  const router = useRouter();
  const { titulo, contenido, fromTab } = useLocalSearchParams<{ titulo?: string; contenido?: string; fromTab?: string }>();

  return (
    <LegalScreen
      titulo={titulo ?? 'Información Legal'}
      contenido={contenido}
      onBack={() => router.replace({ pathname: '/home', params: { openDrawer: 'true', activeTab: fromTab } })}
    />
  );
}
