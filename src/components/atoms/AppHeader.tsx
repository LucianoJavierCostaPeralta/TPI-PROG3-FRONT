import { StyleSheet, View } from 'react-native';
import { Text, useTheme, type MD3Theme } from 'react-native-paper';

export function AppHeader() {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text variant="labelLarge" style={styles.eyebrow}>
        React Native Paper
      </Text>
      <Text variant="headlineMedium">Componentes base</Text>
      <Text variant="bodyMedium" style={styles.description}>
        Pantalla inicial para probar estilos, nombres e imports con arquitectura atomica.
      </Text>
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      gap: 6,
    },
    eyebrow: {
      color: theme.colors.primary,
    },
    description: {
      color: theme.colors.onSurfaceVariant,
    },
  });
