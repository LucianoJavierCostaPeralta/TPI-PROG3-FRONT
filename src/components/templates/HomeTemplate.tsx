import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Text, useTheme, type MD3Theme } from 'react-native-paper';
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
  onTabChange,
  onOpenDrawer,
  onCloseDrawer,
  onSignOut,
  onBellPress,
}: HomeTemplateProps<T>) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.layout}>
        <AppTopBar onMenuPress={onOpenDrawer} onBellPress={onBellPress} />

        <View style={styles.content}>
          <Text variant="headlineMedium">{title}</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {subtitle}
          </Text>
        </View>

        <BottomTabMenu
          items={tabs}
          activeKey={activeTab}
          onChange={onTabChange}
        />
      </View>

      <AppDrawer visible={drawerVisible} onClose={onCloseDrawer} onSignOut={onSignOut} />
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
