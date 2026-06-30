import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Title style={styles.title}>{title}</Title>
            <Subtitle style={styles.subtitle}>{subtitle}</Subtitle>
          </View>

          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: MD3Theme, insets: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    scrollContent: {
      alignItems: 'center',
      paddingHorizontal: spacing.xxl,
      paddingTop: insets.top + spacing.xl,
      paddingBottom: insets.bottom + spacing.xl,
    },

    content: {
      width: '100%',
      maxWidth: 520,
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