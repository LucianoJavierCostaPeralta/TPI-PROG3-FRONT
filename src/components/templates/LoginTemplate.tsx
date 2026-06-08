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
        <View style={styles.header}>
          <Title style={styles.title}>{title}</Title>
          <Subtitle style={styles.subtitle}>{subtitle}</Subtitle>
        </View>

        {children}
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
      paddingHorizontal: spacing.xxl,

      // nuevo: evita que el texto quede pegado al status bar
      paddingTop: insets.top + spacing.xl,

      // nuevo: evita que el contenido quede debajo de la barra inferior del sistema
      paddingBottom: insets.bottom + spacing.xl,
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