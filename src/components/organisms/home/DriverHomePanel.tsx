import { useState } from 'react';
import { View, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import { Text, Surface, useTheme, type MD3Theme, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type AppWorkspace, type DeliveryFilter, type HomeTabKey, ORDER_STATUS } from '../../../types/workspace';
import { palette, spacing } from '../../../styles/theme';
import { CTAButton } from '../../atoms';
import { createStyles } from './HomePanel.styles';
import { EmptyRouteState, CompletedRouteState } from './DriverRouteStates';
import { FollowingStopCard, RemainingStopsList } from './DriverUpcomingStops';
import { getDeliveryStatusBadge, isActiveOrder, isCancelledOrder, isCompletedOrder } from '../../../utils/orders/orderStatus';

type DriverHomePanelProps = {
  workspace: AppWorkspace;
  setActiveTab: (tab: HomeTabKey) => void;
  setDeliveryFilter: (filter: DeliveryFilter) => void;
  onUpdateStatus?: (orderId: string, action: string, clienteDni?: string) => Promise<void>;
  updatingOrderId?: string | null;
};

export function DriverHomePanel({
  workspace,
  setActiveTab,
  setDeliveryFilter,
  onUpdateStatus,
  updatingOrderId,
}: DriverHomePanelProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

// Ordenar entregas del chófer por orden_ruta
const rawDriverOrders = [...(workspace.orders || [])].sort(
  (a, b) => (Number(a.orden_ruta) || 0) - (Number(b.orden_ruta) || 0)
);

// Filtrar las canceladas para que las paradas y conteos se actualicen dinámicamente
const driverOrders = rawDriverOrders.filter((order) => !isCancelledOrder(order));

const completedStops = driverOrders.filter(isCompletedOrder);

const remainingStops = driverOrders.filter((order) => !isCompletedOrder(order));

const totalStops = driverOrders.length;

// Si hay algún pedido en curso (aceptado o en camino), promoverlo al primer lugar para que sea la parada actual
const activeOrderIndex = remainingStops.findIndex(isActiveOrder);
let sortedRemaining = [...remainingStops];
if (activeOrderIndex > 0) {
  const activeOrder = sortedRemaining.splice(activeOrderIndex, 1)[0];
  sortedRemaining.unshift(activeOrder);
}

const nextStopOrder = sortedRemaining[0] || null;
const secondStopOrder = sortedRemaining[1] || null;

// Estado local para DNI en caso de estar en camino
const [dniInput, setDniInput] = useState('');

const handleNavigate = () => {
  if (nextStopOrder) {
    const address = String(nextStopOrder.direccion_destino || nextStopOrder.destino || '');
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`,
    });
    if (url) {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
        }
      });
    }
  }
};

if (totalStops === 0) {
  return <EmptyRouteState message="Cuando el administrador te asigne un pedido, aparecerá aquí." setActiveTab={setActiveTab} />;
}

if (!nextStopOrder) {
  const deliveredCount = driverOrders.filter(isCompletedOrder).length;

  if (deliveredCount === 0) {
    return <EmptyRouteState message="No tienes pedidos asignados para el día de hoy." setActiveTab={setActiveTab} />;
  }

  return (
    <CompletedRouteState
      deliveredCount={deliveredCount}
      setActiveTab={setActiveTab}
      setDeliveryFilter={setDeliveryFilter}
    />
  );
}

const currentStopIndex = completedStops.length + 1;
const distanceSim = (totalStops * 3.5).toFixed(1);

const currentBadge = getDeliveryStatusBadge(nextStopOrder.estado_id, nextStopOrder.estado || undefined);
const isUpdating = updatingOrderId === nextStopOrder.id;

return (
  <View style={styles.panel}>
    {/* PARADA ACTUAL (Tarjeta Importante / Más Grande) */}
    <Surface style={[styles.nextStopCard, { borderColor: currentBadge.color, borderWidth: 1.5 }]} elevation={2}>
      <View style={styles.nextStopHeaderRow}>
        <Text style={[styles.nextStopLabel, { color: currentBadge.color }]}>Parada Actual</Text>
        <View style={[styles.statusBadge, { backgroundColor: currentBadge.bg, flexDirection: 'row', alignItems: 'center' }]}>
          <View style={[styles.statusDot, { backgroundColor: currentBadge.dotColor }]} />
          <Text style={[styles.statusBadgeText, { color: currentBadge.color }]}>{currentBadge.label}</Text>
        </View>
      </View>
      
      <View style={styles.nextStopAddressRow}>
        <View style={styles.nextStopAddressContainer}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: currentBadge.bg, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="map-marker" size={22} color={currentBadge.color} />
          </View>
          <Text style={styles.nextStopAddressText}>
            {String(nextStopOrder.direccion_destino || nextStopOrder.destino || '')}
          </Text>
        </View>
      </View>
      
      <Text style={styles.nextStopSubtitle}>
        Cliente: {String(nextStopOrder.cliente || '')} {nextStopOrder.referencia ? `(${nextStopOrder.referencia})` : ''}
      </Text>

      <View style={styles.metricsDivider} />

      {/* Acciones de la Parada Actual */}
      <View style={styles.currentStopActionBox}>
        {nextStopOrder.estado_id === ORDER_STATUS.ASSIGNED || nextStopOrder.estado?.toLowerCase() === 'assigned' ? (
          <View style={styles.btnRow}>
            <CTAButton
              variant="primary"
              icon="play"
              onPress={() => onUpdateStatus?.(nextStopOrder.id, 'accept')}
              loading={isUpdating}
              style={{ flex: 1 }}
            >
              Iniciar viaje
            </CTAButton>
          </View>
        ) : nextStopOrder.estado_id === ORDER_STATUS.ACCEPTED || nextStopOrder.estado?.toLowerCase() === 'accepted' ? (
          <View style={{ width: '100%' }}>
            <View style={styles.btnRow}>
              <CTAButton
                variant="primary"
                icon="play"
                onPress={() => onUpdateStatus?.(nextStopOrder.id, 'on_the_way')}
                loading={isUpdating}
                style={{ flex: 1 }}
              >
                Comenzar entrega
              </CTAButton>
            </View>
            <View style={[styles.btnRow, { marginTop: spacing.xs }]}>
              <CTAButton
                variant="destructive"
                icon="close"
                onPress={() => {
                  Alert.alert(
                    'Cancelar pedido',
                    '¿Estás seguro de que deseas cancelar este pedido?',
                    [
                      { text: 'No, volver', style: 'cancel' },
                      {
                        text: 'Sí, cancelar',
                        style: 'destructive',
                        onPress: () => onUpdateStatus?.(nextStopOrder.id, 'cancelled'),
                      },
                    ]
                  );
                }}
                disabled={isUpdating}
                style={{ flex: 1 }}
              >
                Cancelar pedido
              </CTAButton>
            </View>
          </View>
        ) : nextStopOrder.estado_id === ORDER_STATUS.ON_THE_WAY || nextStopOrder.estado?.toLowerCase() === 'on_the_way' ? (
          <View style={styles.deliveryProgressForm}>
            <Text style={{ fontSize: 13, fontWeight: '500', color: palette.neutral600, marginBottom: 2 }}>
              DNI del Cliente (8 dígitos)
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Ingresa el DNI del cliente"
              value={dniInput}
              onChangeText={(val) => setDniInput(val.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              maxLength={8}
              style={styles.dniInputHome}
              activeOutlineColor="#2196F3"
              left={<TextInput.Icon icon="account-box-outline" color={palette.neutral400} />}
            />
            <View style={[styles.btnRow, { marginTop: spacing.xs }]}>
              <CTAButton
                variant="primary"
                icon="checkbox-marked-circle-outline"
                onPress={() => {
                  if (dniInput.length === 8) {
                    onUpdateStatus?.(nextStopOrder.id, 'delivered', dniInput);
                    setDniInput('');
                  }
                }}
                disabled={dniInput.length !== 8}
                loading={isUpdating}
                style={{ flex: 1 }}
              >
                Finalizar entrega
              </CTAButton>
              <TouchableOpacity
                style={styles.navigationIconButtonCircular}
                onPress={handleNavigate}
              >
                <MaterialCommunityIcons name="navigation-variant" size={24} color="#1D4ED8" style={{ transform: [{ rotate: '45deg' }] }} />
              </TouchableOpacity>
            </View>
            <View style={[styles.btnRow, { marginTop: spacing.xs }]}>
              <CTAButton
                variant="destructive"
                icon="close"
                onPress={() => {
                  Alert.alert(
                    'Cancelar pedido',
                    '¿Estás seguro de que deseas cancelar este pedido?',
                    [
                      { text: 'No, volver', style: 'cancel' },
                      {
                        text: 'Sí, cancelar',
                        style: 'destructive',
                        onPress: () => onUpdateStatus?.(nextStopOrder.id, 'cancelled'),
                      },
                    ]
                  );
                }}
                disabled={isUpdating}
                style={{ flex: 1 }}
              >
                Cancelar pedido
              </CTAButton>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.metricsDivider} />
      
      <View style={styles.statsContainerRow}>
        <View style={styles.statBox}>
          <MaterialCommunityIcons name="flag-outline" size={22} color="#1D4ED8" />
          <Text style={styles.statLabel}>Parada</Text>
          <Text style={styles.statValue}>{currentStopIndex} de {totalStops}</Text>
        </View>
        <View style={[styles.statBox, styles.statBorder]}>
          <MaterialCommunityIcons name="package-variant-closed" size={22} color="#1D4ED8" />
          <Text style={styles.statLabel}>Entregas Hoy</Text>
          <Text style={styles.statValue}>{totalStops}</Text>
        </View>
        <View style={[styles.statBox, styles.statBorder]}>
          <MaterialCommunityIcons name="map-marker-distance" size={22} color="#1D4ED8" />
          <Text style={styles.statLabel}>Distancia Total</Text>
          <Text style={styles.statValue}>{distanceSim} km</Text>
        </View>
      </View>
    </Surface>

    {secondStopOrder ? <FollowingStopCard order={secondStopOrder} /> : null}

    <RemainingStopsList
      currentStopIndex={currentStopIndex}
      remainingStops={remainingStops}
      setActiveTab={setActiveTab}
    />
  </View>
);
}
