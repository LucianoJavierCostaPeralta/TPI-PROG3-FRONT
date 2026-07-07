import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Surface, Text, useTheme, type MD3Theme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { radii, spacing } from '../../styles/theme';
import { type DeliveryOrder, formatOrderDate, getOrderDestination } from '../../types/workspace';
import { getDeliveryBadgeConfig } from '../../utils/orders/deliveryStatus';

type DeliveryOrderCardProps = {
  order: DeliveryOrder;
  index: number;
  onPress: (order: DeliveryOrder) => void;
};

export function DeliveryOrderCard({ order, index, onPress }: DeliveryOrderCardProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const orderPedId = `#PED-${String(index + 1).padStart(4, '0')}`;
  const badgeConfig = getDeliveryBadgeConfig(order.estado_id, order.estado);

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => onPress(order)}>
      <Surface style={styles.card} elevation={1}>
        <View style={styles.leftContent}>
          <View style={styles.headerRow}>
            <Text variant="titleMedium" style={styles.pedId}>{orderPedId}</Text>
            <View style={[styles.badge, { backgroundColor: badgeConfig.bg }]}>
              <Text variant="labelSmall" style={[styles.badgeText, { color: badgeConfig.text }]}>
                {badgeConfig.label}
              </Text>
            </View>
          </View>

          <Text variant="bodyMedium" style={styles.address} numberOfLines={2}>
            {getOrderDestination(order) || 'Dirección no especificada'}
          </Text>

          <Text variant="bodySmall" style={styles.date}>
            {formatOrderDate(order)}
          </Text>
        </View>

        <View style={styles.rightContent}>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
        </View>
      </Surface>
    </TouchableOpacity>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    leftContent: {
      flex: 1,
      gap: 4,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 2,
    },
    pedId: {
      fontWeight: '800',
      color: theme.colors.onSurface,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    badgeText: {
      fontWeight: '800',
    },
    address: {
      color: theme.colors.onSurface,
    },
    date: {
      color: theme.colors.onSurfaceVariant,
    },
    rightContent: {
      marginLeft: spacing.sm,
    },
  });
