import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme, type MD3Theme } from 'react-native-paper';
import { Title } from '../atoms/Typography';
import { spacing } from '../../styles/theme';

type RegisterTemplateProps = {
  title: string;
  children: React.ReactNode;
};

export function RegisterTemplate({ title, children }: RegisterTemplateProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Title style={styles.title}>{title}</Title>
        </View>

        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: spacing.xxl,
      paddingTop: spacing.xl,
      paddingBottom: 40,
    },
    header: {
      marginBottom: 28,
    },
    title: {
      color: theme.colors.onSurface,
      fontSize: 28,
      lineHeight: 36,
    },
  });
