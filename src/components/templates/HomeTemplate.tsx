import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme, type MD3Theme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
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
}: HomeTemplateProps<T>) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.layout}>
        <AppTopBar onMenuPress={onOpenDrawer} onBellPress={onBellPress} />

        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>{title}</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {subtitle}
          </Text>
        </View>

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
      backgroundColor: theme.colors.background,
    },
    layout: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
      gap: 4,
      backgroundColor: theme.colors.background,
    },
    title: {
      color: theme.colors.onSurface,
      fontWeight: '800',
    },
    subtitle: {
      color: theme.colors.onSurfaceVariant,
    },
    content: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });
