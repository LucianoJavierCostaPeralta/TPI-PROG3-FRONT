import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, useTheme, type MD3Theme } from 'react-native-paper';
import { palette, radii, spacing, typography } from '../../styles/theme';

type AlertaItem = {
  id: string;
  titulo: string;
  hora: string;
};

const mockAlertas: AlertaItem[] = [
  { id: '1', titulo: 'Ruta bloqueada en Av. Libertador', hora: 'Hoy, 09:15' },
  { id: '2', titulo: 'Retraso en entrega #PED-0023', hora: 'Hoy, 08:45' },
  { id: '3', titulo: 'Chofer Luis Ramírez sin conexión', hora: 'Hoy, 08:30' },
];

export function AlertasActivas() {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <Surface style={styles.container} elevation={1}>
      <View style={styles.header}>
        <Text style={styles.title}>Alertas activas</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{mockAlertas.length}</Text>
        </View>
      </View>

      <View style={styles.list}>
        {mockAlertas.map((alerta) => (
          <View key={alerta.id} style={styles.item}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#FBBF24" />
            </View>
            <View style={styles.content}>
              <Text style={styles.itemTitle}>{alerta.titulo}</Text>
              <Text style={styles.itemHour}>{alerta.hora}</Text>
            </View>
          </View>
        ))}
      </View>
    </Surface>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      padding: spacing.lg,
      borderRadius: radii.lg,
      backgroundColor: `${palette.darkGray}E6`,
      borderWidth: 1,
      borderColor: `${palette.primaryBlue}33`,
      gap: spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      color: theme.colors.onPrimary,
      fontFamily: 'Inter-Medium',
      fontSize: 15,
      fontWeight: '500',
    },
    badge: {
      minWidth: 24,
      height: 24,
      borderRadius: radii.pill,
      backgroundColor: `${palette.primaryBlue}1A`,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.sm,
    },
    badgeText: {
      color: palette.primaryBlue,
      fontFamily: 'Inter-SemiBold',
      fontSize: 12,
      fontWeight: '600',
    },
    list: {
      gap: spacing.sm,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radii.md,
      backgroundColor: `${theme.colors.surface}12`,
      borderWidth: 1,
      borderColor: `${theme.colors.surfaceVariant}55`,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: radii.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${'#FBBF24'}20`,
    },
    content: {
      flex: 1,
      gap: 2,
    },
    itemTitle: {
      color: theme.colors.onPrimary,
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      fontWeight: '500',
    },
    itemHour: {
      color: theme.colors.onSurfaceVariant,
      fontFamily: 'Inter-Regular',
      fontSize: 12,
    },
  });
