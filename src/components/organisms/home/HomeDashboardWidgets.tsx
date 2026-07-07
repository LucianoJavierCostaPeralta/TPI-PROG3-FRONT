import { View, TouchableOpacity } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Text, IconButton, Surface, useTheme, type MD3Theme } from 'react-native-paper';
import { createStyles } from './HomePanel.styles';

export type PieChartSegment = {
  percentage: number;
  color: string;
};

export function DonutChart({ segments, total }: { segments: PieChartSegment[]; total: number }) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const radius = 46;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = -90;

  return (
    <View style={styles.chartContainer}>
      <Svg width={140} height={140} viewBox="0 0 120 120">
        <G>
          <Circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke={theme.colors.outline}
            strokeWidth={strokeWidth}
          />
          {segments.map((segment, index) => {
            const strokeDashoffset = circumference * (1 - segment.percentage);
            const rotation = currentAngle;
            currentAngle += segment.percentage * 360;

            if (segment.percentage <= 0) return null;

            return (
              <G key={index} rotation={rotation} origin="60, 60">
                <Circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </G>
            );
          })}
        </G>
      </Svg>
      <View style={styles.chartCenterText}>
        <Text variant="headlineMedium" style={styles.chartCenterValue}>{total}</Text>
        <Text variant="labelSmall" style={styles.chartCenterLabel}>Total</Text>
      </View>
    </View>
  );
}

export function LegendItem({ label, count, percentage, color }: { label: string; count: number; percentage: number; color: string }) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <View style={styles.legendItem}>
      <View style={styles.legendItemLeft}>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <Text variant="bodyMedium" style={styles.legendLabel}>{label}</Text>
      </View>
      <View style={styles.legendItemRight}>
        <Text variant="bodyMedium" style={styles.legendItemCount}>{count}</Text>
        <Text variant="bodySmall" style={styles.legendItemPercentage}>({percentage}%)</Text>
      </View>
    </View>
  );
}

export function QuickActionButton({ label, icon, color, onPress }: { label: string; icon: string; color: string; onPress: () => void }) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <Surface style={styles.actionCard} elevation={1}>
      <TouchableOpacity onPress={onPress} style={styles.actionCardTouchableOpacity}>
        <IconButton icon={icon} iconColor={color} size={28} style={styles.actionButtonIcon} />
        <Text variant="labelLarge" style={styles.actionButtonText}>{label}</Text>
      </TouchableOpacity>
    </Surface>
  );
}

export function Metric({ label, value }: { label: string; value: string | number }) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <Surface style={styles.metricCard} elevation={1}>
      <Text variant="labelMedium" style={styles.mutedText}>{label}</Text>
      <Text variant="headlineSmall" style={styles.primaryText}>{value}</Text>
    </Surface>
  );
}
