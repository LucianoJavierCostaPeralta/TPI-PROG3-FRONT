import { useRouter } from 'expo-router';
import { EditarPerfilScreen } from '../screens/EditarPerfilScreen';

export default function EditarPerfilRoute() {
  const router = useRouter();

  return (
    <EditarPerfilScreen
      onBack={() => router.back()}
      onSaveSuccess={() => router.back()}
    />
  );
}
