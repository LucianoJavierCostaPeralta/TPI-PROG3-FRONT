import { useRouter } from 'expo-router';
import { PerfilScreen } from '../screens/PerfilScreen';

export default function PerfilRoute() {
  const router = useRouter();

  return (
    <PerfilScreen
      onBack={() => router.back()}
      onEdit={() => router.push('/editar-perfil')}
    />
  );
}
