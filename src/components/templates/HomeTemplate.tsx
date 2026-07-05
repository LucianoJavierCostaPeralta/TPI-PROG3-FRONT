import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme, type MD3Theme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  AppTopBar,
  BottomTabMenu,
  type BottomTabMenuItem,
} from '../molecules';
import { AppDrawer } from '../organisms';

type HomeTemplateProps<T extends string> = {
  title: string;
  subtitle: string;
  tabs: Array<BottomTabMenuItem<T>>;
  activeTab: T;
  drawerVisible: boolean;
  children?: ReactNode;
  onTabChange: (tab: T) => void;
  onOpenDrawer: () => void;
  onCloseDrawer: () => void;
  onSignOut: () => void;
  onBellPress?: () => void;
  onBack?: () => void;
  bellActive?: boolean;
  unreadCount?: number;
};

export function HomeTemplate<T extends string>({
  title,
  subtitle,
  tabs,
  activeTab,
  drawerVisible,
  children,
  onTabChange,
  onOpenDrawer,
  onCloseDrawer,
  onSignOut,
  onBellPress,
  onBack,
  bellActive = false,
  unreadCount = 0,
}: HomeTemplateProps<T>) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor={theme.colors.primary} />
      <View style={styles.layout}>
        <AppTopBar
          title={activeTab === 'home' ? 'ZoneScore' : title}
          onMenuPress={onOpenDrawer}
          onBackPress={onBack}
          onBellPress={onBellPress}
          bellActive={bellActive}
          unreadCount={unreadCount}
        />

        <View style={styles.content}>{children}</View>

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
      backgroundColor: theme.colors.primary,
    },
    layout: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });
