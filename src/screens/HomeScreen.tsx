import { useState } from 'react';
import { HomeTemplate } from '../components/templates';
import { type BottomTabMenuItem } from '../components/molecules';

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

export function HomeScreen() {
  const [activeTab, setActiveTab] = useState<HomeTabKey>('home');
  const [drawerVisible, setDrawerVisible] = useState(false);

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
