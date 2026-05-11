import { SafeAreaView, StyleSheet, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { BottomTabBar } from '../organisms/BottomTabBar';
import { TopBar } from '../organisms/TopBar';

type HomeTemplateProps = {
  headerLabel: string;
  content: React.ReactNode;
  activeTab: 'home' | 'profile' | 'settings';
  onTabPress: (tab: 'home' | 'profile' | 'settings') => void;
};

export function HomeTemplate({
  headerLabel,
  content,
  activeTab,
  onTabPress,
}: HomeTemplateProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.phoneFrame}>
        <TopBar label={headerLabel} />
        <View style={styles.content}>{content}</View>
        <BottomTabBar activeTab={activeTab} onTabPress={onTabPress} />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.appBackground,
    },
    phoneFrame: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
    },
    content: {
      flex: 1,
    },
  });
