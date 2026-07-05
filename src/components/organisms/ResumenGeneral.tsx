import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, useTheme, type MD3Theme } from 'react-native-paper';
import { palette, radii, spacing, typography } from '../../styles/theme';

type ResumenMetric = {
  label: string;
  value: string | number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  accent: string;
};

type ResumenGeneralProps = {
  title?: string;
  subtitle?: string;
  metrics?: ResumenMetric[];
};

const defaultMetrics: ResumenMetric[] = [
  { label: 'Entregas hoy', value: 24, icon: 'truck-fast-outline', accent: palette.primaryBlue },
  { label: 'En camino', value: 8, icon: 'map-marker-path', accent: '#4F8EF7' },
  { label: 'Pendientes', value: 13, icon: 'clock-outline', accent: '#5FC8FF' },
  { label: 'Retrasadas', value: 3, icon: 'alert-circle-outline', accent: '#FF6B6B' },
];

export function ResumenGeneral({
  title = 'Resumen general',
  subtitle = 'Seguimiento rápido del día',
  metrics = defaultMetrics,
}: ResumenGeneralProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

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
        {metrics.map((item) => (
          <View key={item.label} style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: `${item.accent}16` }]}> 
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
      backgroundColor: palette.darkGray,
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
      color: theme.colors.onPrimary,
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
      backgroundColor: palette.primaryBlue,
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
      borderColor: `${palette.primaryBlue}33`,
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
      color: palette.darkGray,
      fontWeight: '600',
    },
    label: {
      fontSize: 13,
      lineHeight: 18,
      fontFamily: 'Inter-Regular',
      color: theme.colors.onSurfaceVariant,
    },
  });
