import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, useTheme, type MD3Theme } from 'react-native-paper';
import { radii, spacing, typography } from '../../styles/theme';

type ResumenMetric = {
  label: string;
  value: string | number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  accent: string;
  accentContainer: string;
};

type ResumenGeneralProps = {
  title?: string;
  subtitle?: string;
  metrics?: ResumenMetric[];
};

const buildDefaultMetrics = (theme: MD3Theme): ResumenMetric[] => [
  { label: 'Entregas hoy', value: 24, icon: 'truck-fast-outline', accent: theme.colors.primary, accentContainer: theme.colors.primaryContainer },
  { label: 'En camino', value: 8, icon: 'map-marker-path', accent: theme.colors.primary, accentContainer: theme.colors.primaryContainer },
  { label: 'Pendientes', value: 13, icon: 'clock-outline', accent: theme.colors.tertiary, accentContainer: theme.colors.tertiaryContainer },
  { label: 'Retrasadas', value: 3, icon: 'alert-circle-outline', accent: theme.colors.error, accentContainer: theme.colors.errorContainer },
];

export function ResumenGeneral({
  title = 'Resumen general',
  subtitle = 'Seguimiento rápido del día',
  metrics,
}: ResumenGeneralProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const items = metrics ?? buildDefaultMetrics(theme);

  return (
    <Surface style={styles.container} elevation={1}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="titleMedium" style={styles.title}>
            {title}
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            {subtitle}
          </Text>
        </View>
        <View style={styles.headerDot} />
      </View>

      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.label} style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: item.accentContainer }]}> 
              <MaterialCommunityIcons name={item.icon} size={20} color={item.accent} />
            </View>
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.label}>{item.label}</Text>
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
      backgroundColor: theme.colors.surface,
      gap: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    headerText: {
      flex: 1,
      gap: spacing.xs,
    },
    title: {
      color: theme.colors.onSurface,
      fontFamily: 'Inter-SemiBold',
      fontWeight: '600',
    },
    subtitle: {
      color: theme.colors.onSurfaceVariant,
      fontFamily: 'Inter-Regular',
    },
    headerDot: {
      width: spacing.md,
      height: spacing.md,
      borderRadius: radii.pill,
      backgroundColor: theme.colors.primary,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    card: {
      width: '48%',
      minWidth: 140,
      backgroundColor: theme.colors.surface,
      borderRadius: radii.md,
      padding: spacing.md,
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    iconWrap: {
      width: spacing.xxl,
      height: spacing.xxl,
      borderRadius: radii.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    value: {
      fontSize: 24,
      lineHeight: 30,
      fontFamily: 'Inter-SemiBold',
      color: theme.colors.onSurface,
      fontWeight: '600',
    },
    label: {
      fontSize: 13,
      lineHeight: 18,
      fontFamily: 'Inter-Regular',
      color: theme.colors.onSurfaceVariant,
    },
  });
