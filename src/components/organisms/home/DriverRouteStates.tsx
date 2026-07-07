import { View } from 'react-native';
import { Text, Surface, useTheme, type MD3Theme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type DeliveryFilter, type HomeTabKey } from '../../../types/workspace';
import { palette } from '../../../styles/theme';
import { CTAButton } from '../../atoms';
import { Metric } from './HomeDashboardWidgets';
import { createStyles } from './HomePanel.styles';

type EmptyRouteStateProps = {
  message: string;
  setActiveTab: (tab: HomeTabKey) => void;
};

export function EmptyRouteState({ message, setActiveTab }: EmptyRouteStateProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <View style={styles.panel}>
      <Surface style={styles.completedStateCard} elevation={1}>
        <MaterialCommunityIcons name="truck-delivery-outline" size={64} color={palette.neutral400} />
        <Text variant="headlineSmall" style={styles.completedTitleText}>Sin entregas asignadas</Text>
        <Text variant="bodyMedium" style={styles.completedSubtitleText}>{message}</Text>
        <CTAButton variant="primary" onPress={() => setActiveTab('deliveries')} icon="calendar-text-outline">
          Ver mis pedidos
        </CTAButton>
      </Surface>
    </View>
  );
}

type CompletedRouteStateProps = {
  deliveredCount: number;
  setActiveTab: (tab: HomeTabKey) => void;
  setDeliveryFilter: (filter: DeliveryFilter) => void;
};

export function CompletedRouteState({ deliveredCount, setActiveTab, setDeliveryFilter }: CompletedRouteStateProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <View style={styles.panel}>
      <Surface style={styles.completedStateCard} elevation={1}>
        <MaterialCommunityIcons name="check-circle-outline" size={64} color={palette.successDark} />
        <Text variant="headlineSmall" style={styles.completedTitleText}>¡Ruta completada!</Text>
        <Text variant="bodyMedium" style={styles.completedSubtitleText}>
          Completaste las {deliveredCount} entregas asignadas para el día de hoy.
        </Text>
        <View style={styles.metricsRow}>
          <Metric label="Realizadas" value={deliveredCount} />
          <Metric label="Distancia aprox." value={`${(deliveredCount * 3.5).toFixed(1)} km`} />
        </View>
        <CTAButton
          variant="secondary"
          onPress={() => {
            setDeliveryFilter('realizado');
            setActiveTab('deliveries');
          }}
          icon="history"
          style={{ marginTop: 12 }}
        >
          Ver historial de entregas
        </CTAButton>
      </Surface>
    </View>
  );
}
