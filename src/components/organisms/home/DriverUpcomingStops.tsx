import { View, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme, type MD3Theme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type DeliveryOrder, type HomeTabKey } from '../../../types/workspace';
import { palette } from '../../../styles/theme';
import { getDeliveryStatusBadge } from '../../../utils/orders/orderStatus';
import { createStyles } from './HomePanel.styles';

type FollowingStopCardProps = {
  order: DeliveryOrder;
};

export function FollowingStopCard({ order }: FollowingStopCardProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const badge = getDeliveryStatusBadge(order.estado_id, order.estado || undefined);

  return (
    <Surface style={styles.followingStopCard} elevation={1}>
      <Text style={styles.followingStopTitle}>Siguiente parada</Text>
      <View style={styles.followingStopBodyRow}>
        <View style={[styles.followingStopLeftCircle, { backgroundColor: badge.bg }]}> 
          <MaterialCommunityIcons name="map-marker" size={20} color={badge.color} />
        </View>
        <View style={styles.followingStopMiddle}>
          <View style={styles.followingStopAddressRow}>
            <Text style={styles.followingStopAddress} numberOfLines={1}>
              {String(order.direccion_destino || order.destino || '')}
            </Text>
            <View style={[styles.statusBadgeSmall, { backgroundColor: badge.bg }]}> 
              <View style={[styles.greenDot, { backgroundColor: badge.dotColor }]} />
              <Text style={[styles.statusBadgeTextSmall, { color: badge.color }]}>{badge.label}</Text>
            </View>
          </View>
          <Text style={styles.followingStopClient}>Cliente: {String(order.cliente || '')}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={palette.neutral400} />
      </View>
    </Surface>
  );
}

type RemainingStopsListProps = {
  currentStopIndex: number;
  remainingStops: DeliveryOrder[];
  setActiveTab: (tab: HomeTabKey) => void;
};

export function RemainingStopsList({ currentStopIndex, remainingStops, setActiveTab }: RemainingStopsListProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  if (remainingStops.length <= 2) return null;

  return (
    <Surface style={styles.remainingStopsContainer} elevation={1}>
      <Text style={styles.remainingTitle}>Resto del recorrido</Text>
      <View style={styles.remainingList}>
        {remainingStops.slice(2, 5).map((order, idx) => {
          const stopNum = currentStopIndex + idx + 2;
          const etaTimeSim = (idx + 3) * 8 - 1;
          return (
            <View key={order.id} style={styles.remainingItemRow}>
              <View style={styles.remainingItemLeft}>
                <View style={styles.circleBadge}>
                  <Text style={styles.circleBadgeText}>{stopNum}</Text>
                </View>
                <Text style={styles.remainingAddressText} numberOfLines={1}>
                  {String(order.direccion_destino || order.destino || '')}
                </Text>
              </View>
              <Text style={styles.remainingTimeText}>{etaTimeSim} min</Text>
            </View>
          );
        })}
      </View>
      <TouchableOpacity style={styles.viewAllButton} onPress={() => setActiveTab('deliveries')} activeOpacity={0.7}>
        <Text style={styles.viewAllText}>Ver todas las entregas v</Text>
      </TouchableOpacity>
    </Surface>
  );
}
