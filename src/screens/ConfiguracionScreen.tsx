import { StyleSheet, useColorScheme } from 'react-native';
import {
  RadioButton,
  Surface,
  Text,
  useTheme,
  type MD3Theme,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../store';
import { resolverTema, setModoTema, type ModoTema } from '../store/slices/temaSlice';
import { TEMA_STORAGE_KEY } from '../store/AppProviders';
import { spacing } from '../styles/theme';
import { ScreenLayout } from '../components/templates';

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
    <ScreenLayout
      title="Configuración"
      subtitle="Preferencias de la aplicación"
      onBack={onBack}
    >
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
    </ScreenLayout>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
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
