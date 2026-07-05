import { useRouter, useLocalSearchParams } from 'expo-router';
import { LegalScreen } from '../../screens/LegalScreen';

export default function LegalRoute() {
  const router = useRouter();
  const { titulo, contenido } = useLocalSearchParams<{ titulo?: string; contenido?: string }>();

  return (
    <LegalScreen
      titulo={titulo ?? 'Información Legal'}
      contenido={contenido}
      onBack={() => router.back()}
    />
  );
}
