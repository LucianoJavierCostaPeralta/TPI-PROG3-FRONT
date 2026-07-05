import { useRouter, useLocalSearchParams } from 'expo-router';
import { EditarPerfilScreen } from '../../screens/EditarPerfilScreen';

export default function EditarPerfilRoute() {
  const router = useRouter();
  const { fromTab } = useLocalSearchParams<{ fromTab?: string }>();

  const handleGoBack = () => {
    router.replace({ pathname: '/home', params: { openDrawer: 'true', activeTab: fromTab } });
  };

  return (
    <EditarPerfilScreen
      onBack={handleGoBack}
      onSaveSuccess={handleGoBack}
    />
  );
}
