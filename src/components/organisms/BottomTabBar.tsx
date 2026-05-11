import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { BottomTabItem } from '../molecules/BottomTabItem';

export const tabs = [
  { key: 'home', label: 'CASA', icon: 'home' as const },
  { key: 'profile', label: 'PERFIL', icon: 'person' as const },
  { key: 'settings', label: 'CONFIG', icon: 'settings' as const },
] as const;

export type TabKey = (typeof tabs)[number]['key'];

type BottomTabBarProps = {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
};

export function BottomTabBar({
  activeTab,
  onTabPress,
}: BottomTabBarProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <BottomTabItem
          key={tab.key}
          label={tab.label}
          icon={tab.icon}
          active={activeTab === tab.key}
          onPress={() => onTabPress(tab.key)}
        />
      ))}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceSoft,
    },
  });
