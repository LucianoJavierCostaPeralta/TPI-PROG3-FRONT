import { useEffect } from 'react';
import { StyleSheet, View, BackHandler } from 'react-native';
import { Text, useTheme, type MD3Theme, Surface } from 'react-native-paper';
import { ScreenLayout } from '../components/templates/ScreenLayout';
import { spacing, radii } from '../styles/theme';
import { getLegalContent } from '../constants/legal';

type LegalScreenProps = {
  titulo: string;
  contenido?: string;
  onBack: () => void;
};

export function LegalScreen({ titulo, contenido, onBack }: LegalScreenProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  useEffect(() => {
    const handleBack = () => {
      onBack();
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => subscription.remove();
  }, [onBack]);

  const textContent = getLegalContent(titulo, contenido);

  return (
    <ScreenLayout
      title={titulo}
      subtitle="Información legal"
      onBack={onBack}
      scrollable={true}
    >
      <Surface style={styles.card} elevation={1}>
        <Text variant="titleMedium" style={styles.cardTitle}>
          {titulo}
        </Text>
        <View style={styles.divider} />
        <Text variant="bodyMedium" style={styles.text}>
          {textContent}
        </Text>
      </Surface>
    </ScreenLayout>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    card: {
      padding: spacing.lg,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface,
    },
    cardTitle: {
      color: theme.colors.onSurface,
      fontWeight: '700',
      marginBottom: spacing.md,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.outline,
      marginBottom: spacing.md,
    },
    text: {
      color: theme.colors.onSurfaceVariant,
      lineHeight: 22,
      textAlign: 'justify',
    },
  });
