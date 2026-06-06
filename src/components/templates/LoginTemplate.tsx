import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme, type MD3Theme } from 'react-native-paper';
import { Title, Subtitle } from '../atoms/Typography';
import { spacing } from '../../styles/theme';

type LoginTemplateProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function LoginTemplate({
  title,
  subtitle,
  children,
}: LoginTemplateProps) {
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
          <Subtitle style={styles.subtitle}>{subtitle}</Subtitle>
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
      marginBottom: spacing.xl,
    },
    title: {
      marginBottom: 10,
    },
    subtitle: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 22,
    },
  });
