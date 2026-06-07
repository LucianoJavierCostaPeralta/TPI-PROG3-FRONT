import { useState } from 'react';
import { Alert } from 'react-native';
import { HomeTemplate } from '../components/templates';
import { type BottomTabMenuItem } from '../components/molecules';
import { signOut } from '../lib/auth';

type HomeScreenProps = {
  navigation?: {
    reset: (state: { index: number; routes: Array<{ name: string }> }) => void;
  };
};

type HomeTabKey = 'home' | 'deliveries' | 'drivers' | 'map';

const bottomTabs: Array<BottomTabMenuItem<HomeTabKey>> = [
  {
    key: 'home',
    label: 'Home',
    icon: 'home-outline',
    activeIcon: 'home',
  },
  {
    key: 'deliveries',
    label: 'Entregas',
    icon: 'truck-outline',
    activeIcon: 'truck',
  },
  {
    key: 'drivers',
    label: 'Choferes',
    icon: 'account-group-outline',
    activeIcon: 'account-group',
  },
  {
    key: 'map',
    label: 'Mapa',
    icon: 'map-outline',
    activeIcon: 'map',
  },
];

export function HomeScreen({ navigation }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<HomeTabKey>('home');
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation?.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo cerrar sesión.';
      Alert.alert('Error', message);
    }
  };

  return (
    <HomeTemplate
      title={getTitle(activeTab)}
      subtitle="Sección activa de ZoneScore."
      tabs={bottomTabs}
      activeTab={activeTab}
      drawerVisible={drawerVisible}
      onTabChange={setActiveTab}
      onOpenDrawer={() => setDrawerVisible(true)}
      onCloseDrawer={() => setDrawerVisible(false)}
      onSignOut={handleSignOut}
      onBellPress={() => undefined}
    />
  );
}

function getTitle(activeTab: HomeTabKey) {
  const labels: Record<HomeTabKey, string> = {
    home: 'Home',
    deliveries: 'Entregas',
    drivers: 'Choferes',
    map: 'Mapa',
  };

  return labels[activeTab];
}
