import { useState } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { HomeTemplate } from '../components/templates';
import { AdminMapScreen } from './AdminMapScreen';
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
    >
      {activeTab === 'map' ? (
        <AdminMapScreen />
      ) : (
        <View style={styles.placeholder}>
          <Text>{getPlaceholder(activeTab)}</Text>
        </View>
      )}
    </HomeTemplate>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    marginTop: 24,
  },
});

function getPlaceholder(activeTab: HomeTabKey) {
  const placeholders: Record<HomeTabKey, string> = {
    home: 'Bienvenido a tu panel principal.',
    deliveries: 'Aquí verás el estado de las entregas.',
    drivers: 'Aquí verás información de choferes.',
    map: 'Mapa de proveedores',
  };

  return placeholders[activeTab];
}

function getTitle(activeTab: HomeTabKey) {
  const labels: Record<HomeTabKey, string> = {
    home: 'Home',
    deliveries: 'Entregas',
    drivers: 'Choferes',
    map: 'Mapa de proveedores',
  };

  return labels[activeTab];
}
