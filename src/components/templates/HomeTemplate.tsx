import { StyleSheet, View } from 'react-native';
import { Text, useTheme, type MD3Theme } from 'react-native-paper';
// importamos safeareaview desde la libreria de context para tener control de los bordes
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppTopBar,
  BottomTabMenu,
  type BottomTabMenuItem,
} from '../molecules';
import { AppDrawer } from '../organisms';

import type { ReactNode } from 'react';

type HomeTemplateProps<T extends string> = {
  title: string;
  subtitle: string;
  tabs: Array<BottomTabMenuItem<T>>;
  activeTab: T;
  drawerVisible: boolean;
  onTabChange: (tab: T) => void;
  onOpenDrawer: () => void;
  onCloseDrawer: () => void;
  onSignOut: () => void;
  onBellPress?: () => void;
  children?: ReactNode;
};

export function HomeTemplate<T extends string>({
  title,
  subtitle,
  tabs,
  activeTab,
  drawerVisible,
  onTabChange,
  onOpenDrawer,
  onCloseDrawer,
  onSignOut,
  onBellPress,
  children,
}: HomeTemplateProps<T>) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    // le decimos al area segura que solo aplique margenes arriba, izquierda y derecha
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      
      {/* quitamos el paddingbottom manual para dejar que el menu lo gestione solo */}
      <View style={styles.layout}>
        
        <AppTopBar onMenuPress={onOpenDrawer} onBellPress={onBellPress} />

        <View style={styles.content}>
          <Text variant="headlineMedium">{title}</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {subtitle}
          </Text>
          {children}
        </View>

        <BottomTabMenu
          items={tabs}
          activeKey={activeTab}
          onChange={onTabChange}
        />
      </View>

      <AppDrawer
        visible={drawerVisible}
        onClose={onCloseDrawer}
        onSignOut={onSignOut}
      />
    </SafeAreaView>
  );
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