import { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Text, useTheme, type MD3Theme } from 'react-native-paper';

import {
  AppTopBar,
  BottomTabMenu,
  type BottomTabMenuItem,
} from '../components/molecules';
import { AppDrawer } from '../components/organisms';

type HomeTabKey = 'home' | 'deliveries' | 'drivers' | 'map';

// Items que aparecen en el menu inferior.
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
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const [activeTab, setActiveTab] = useState<HomeTabKey>('home');
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.layout}>
        <AppTopBar
          onMenuPress={() => setDrawerVisible(true)}
          onBellPress={() => undefined}
        />

        <View style={styles.content}>
          <Text variant="headlineMedium">{getTitle(activeTab)}</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Seccion activa de ZoneScore.
          </Text>
        </View>

        <BottomTabMenu
          items={bottomTabs}
          activeKey={activeTab}
          onChange={setActiveTab}
        />
      </View>

      <AppDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </SafeAreaView>
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

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    layout: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      gap: 8,
      padding: 24,
      backgroundColor: theme.colors.background,
    },
    subtitle: {
      color: theme.colors.onSurfaceVariant,
    },
  });
