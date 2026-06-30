import { ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import {
  IconButton,
  RadioButton,
  Surface,
  Text,
  useTheme,
  type MD3Theme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../store';
import { resolverTema, setModoTema, type ModoTema } from '../store/slices/temaSlice';
import { TEMA_STORAGE_KEY } from '../store/AppProviders';
import { spacing } from '../styles/theme';

type ConfiguracionScreenProps = {
  onBack: () => void;
};

export function ConfiguracionScreen({ onBack }: ConfiguracionScreenProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme();
  const modoTema = useAppSelector((state) => state.tema.modo);
  const temaResuelto = resolverTema(modoTema, colorScheme);

  const handleTemaChange = (modo: ModoTema) => {
    dispatch(setModoTema(modo));
    void AsyncStorage.setItem(TEMA_STORAGE_KEY, modo);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={onBack} />
        <View style={styles.headerText}>
          <Text variant="titleLarge" style={styles.title}>Configuración</Text>
          <Text variant="bodySmall" style={styles.subtitle}>Preferencias de la aplicación</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Surface style={styles.section} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Tema</Text>
          <Text variant="bodySmall" style={styles.description}>
            Elegí cómo querés ver la app. En sistema se usa el modo del dispositivo.
          </Text>

          <RadioButton.Group
            value={modoTema}
            onValueChange={(value) => handleTemaChange(value as ModoTema)}
          >
            <RadioButton.Item label="Sistema" value="sistema" />
            <RadioButton.Item label="Claro" value="claro" />
            <RadioButton.Item label="Oscuro" value="oscuro" />
          </RadioButton.Group>

          <Text variant="bodySmall" style={styles.currentMode}>
            Tema activo: {temaResuelto === 'oscuro' ? 'Oscuro' : 'Claro'}
          </Text>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: spacing.lg,
      backgroundColor: theme.colors.background,
    },
    headerText: {
      flex: 1,
    },
    title: {
      color: theme.colors.onSurface,
      fontWeight: '800',
    },
    subtitle: {
      color: theme.colors.onSurfaceVariant,
    },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xxxl,
    },
    section: {
      borderRadius: 8,
      padding: spacing.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    sectionTitle: {
      color: theme.colors.onSurface,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
    description: {
      color: theme.colors.onSurfaceVariant,
      marginBottom: spacing.md,
    },
    currentMode: {
      color: theme.colors.onSurfaceVariant,
      marginTop: spacing.sm,
    },
  });
