import { ScrollView, StyleSheet } from 'react-native';
import { useTheme, type MD3Theme } from 'react-native-paper';

import { AppHeader } from '../atoms/AppHeader';

type HomeTemplateProps = {
  children: React.ReactNode;
};

export function HomeTemplate({ children }: HomeTemplateProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <AppHeader />
      {children}
    </ScrollView>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      gap: 16,
      padding: 18,
      paddingBottom: 32,
    },
  });
