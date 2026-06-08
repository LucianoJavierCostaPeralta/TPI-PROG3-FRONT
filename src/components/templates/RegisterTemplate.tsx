import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, type MD3Theme } from 'react-native-paper';
import { Title } from '../atoms/Typography';
import { spacing } from '../../styles/theme';

type RegisterTemplateProps = {
  title: string;
  children: React.ReactNode;
};

export function RegisterTemplate({ title, children }: RegisterTemplateProps) {
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

      // nuevo: evita que el título quede pegado al status bar
      paddingTop: insets.top + spacing.xl,

      // nuevo: evita que el contenido quede debajo de la barra de gestos / home indicator
      paddingBottom: insets.bottom + spacing.xl,
    },

    header: {
      marginBottom: spacing.xl, // ajustado: consistencia con otros templates
    },

    title: {
      color: theme.colors.onSurface,
      fontSize: 28,
      lineHeight: 36,
    },
  });