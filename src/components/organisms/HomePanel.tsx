import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Text, IconButton, Surface, useTheme, type MD3Theme, TextInput } from 'react-native-paper';
import { type AppWorkspace, type HomeTabKey, type DeliveryFilter, ORDER_STATUS } from '../../types/workspace';
import { radii, palette, spacing } from '../../styles/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CTAButton } from '../atoms';

type PieChartSegment = {
  percentage: number;
  color: string;
};

function DonutChart({ segments, total }: { segments: PieChartSegment[]; total: number }) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const radius = 46;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius; // ~289.02

  let currentAngle = -90; // Start at the top

  return (
    <View style={styles.chartContainer}>
      <Svg width={140} height={140} viewBox="0 0 120 120">
        <G>
          {/* Background circle */}
          <Circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke={palette.neutral200}
            strokeWidth={strokeWidth}
          />
          {/* Segments */}
          {segments.map((segment, index) => {
            const strokeDashoffset = circumference * (1 - segment.percentage);
            const rotation = currentAngle;
            // Accumulate angle for the next segment
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
        <Text variant="headlineMedium" style={styles.chartCenterValue}>
          {total}
        </Text>
        <Text variant="labelSmall" style={styles.chartCenterLabel}>
          Total
        </Text>
      </View>
    </View>
  );
}

function LegendItem({ label, count, percentage, color }: { label: string; count: number; percentage: number; color: string }) {
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

function QuickActionButton({ label, icon, color, onPress }: { label: string; icon: string; color: string; onPress: () => void }) {
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

function Metric({ label, value }: { label: string; value: string | number }) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  return (
    <Surface style={styles.metricCard} elevation={1}>
      <Text variant="labelMedium" style={styles.mutedText}>{label}</Text>
      <Text variant="headlineSmall" style={styles.primaryText}>{value}</Text>
    </Surface>
  );
}

export function HomePanel({
  workspace,
  setActiveTab,
  setShowDeliveryForm,
  setShowDriverForm,
  setDeliveryFilter,
  onUpdateStatus,
  updatingOrderId,
}: {
  workspace: AppWorkspace;
  setActiveTab: (tab: HomeTabKey) => void;
  setShowDeliveryForm: (show: boolean) => void;
  setShowDriverForm: (show: boolean) => void;
  setDeliveryFilter: (filter: DeliveryFilter) => void;
  onUpdateStatus?: (orderId: string, action: string, clienteDni?: string) => Promise<void>;
  updatingOrderId?: string | null;
}) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  if (workspace.profile.rol === 'asesor') {
    return (
      <View style={styles.panel}>
        <Surface style={styles.summaryCard} elevation={1}>
          <Text variant="titleMedium" style={styles.cardTitle}>Asesor</Text>
          <Text variant="headlineSmall" style={styles.primaryText}>{workspace.profile.nombre}</Text>
          <Text variant="bodyMedium" style={styles.mutedText}>Admins usando la app: {workspace.admins.length}</Text>
        </Surface>
      </View>
    );
  }

  if (workspace.profile.rol === 'chofer') {
    // Ordenar entregas del chófer por orden_ruta
    const rawDriverOrders = [...(workspace.orders || [])].sort(
      (a, b) => (Number(a.orden_ruta) || 0) - (Number(b.orden_ruta) || 0)
    );

    // Filtrar las canceladas para que las paradas y conteos se actualicen dinámicamente
    const driverOrders = rawDriverOrders.filter(
      (o) => o.estado_id !== ORDER_STATUS.CANCELLED && 
             !['7', 'cancelado', 'cancelled'].includes(String(o.estado || '').toLowerCase())
    );

    const completedStops = driverOrders.filter(
      (o) => o.estado_id === ORDER_STATUS.DELIVERED || 
             o.estado_id === ORDER_STATUS.FINISHED || 
             ['realizado', 'entregado', 'finalizado'].includes(String(o.estado || '').toLowerCase())
    );
    
    const remainingStops = driverOrders.filter(
      (o) => !(o.estado_id === ORDER_STATUS.DELIVERED || 
               o.estado_id === ORDER_STATUS.FINISHED || 
               ['realizado', 'entregado', 'finalizado'].includes(String(o.estado || '').toLowerCase()))
    );

    const totalStops = driverOrders.length;

    // Si hay algún pedido en curso (aceptado o en camino), promoverlo al primer lugar para que sea la parada actual
    const activeOrderIndex = remainingStops.findIndex(
      (o) => o.estado_id === ORDER_STATUS.ACCEPTED || o.estado_id === ORDER_STATUS.ON_THE_WAY
    );
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
      return (
        <View style={styles.panel}>
          <Surface style={styles.completedStateCard} elevation={1}>
            <MaterialCommunityIcons name="truck-delivery-outline" size={64} color={palette.neutral400} />
            <Text variant="headlineSmall" style={styles.completedTitleText}>Sin entregas asignadas</Text>
            <Text variant="bodyMedium" style={styles.completedSubtitleText}>
              Cuando el administrador te asigne un pedido, aparecerá aquí.
            </Text>
            <CTAButton
              variant="primary"
              onPress={() => setActiveTab('deliveries')}
              icon="calendar-text-outline"
            >
              Ver mis pedidos
            </CTAButton>
          </Surface>
        </View>
      );
    }

    if (!nextStopOrder) {
      const deliveredCount = driverOrders.filter(
        (o) => o.estado_id === ORDER_STATUS.DELIVERED || 
               o.estado_id === ORDER_STATUS.FINISHED || 
               ['realizado', 'entregado', 'finalizado'].includes(String(o.estado || '').toLowerCase())
      ).length;

      if (deliveredCount === 0) {
        return (
          <View style={styles.panel}>
            <Surface style={styles.completedStateCard} elevation={1}>
              <MaterialCommunityIcons name="truck-delivery-outline" size={64} color={palette.neutral400} />
              <Text variant="headlineSmall" style={styles.completedTitleText}>Sin entregas asignadas</Text>
              <Text variant="bodyMedium" style={styles.completedSubtitleText}>
                No tienes pedidos asignados para el día de hoy.
              </Text>
              <CTAButton
                variant="primary"
                onPress={() => setActiveTab('deliveries')}
                icon="calendar-text-outline"
              >
                Ver mis pedidos
              </CTAButton>
            </Surface>
          </View>
        );
      }

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

    const currentStopIndex = completedStops.length + 1;
    const distanceSim = (totalStops * 3.5).toFixed(1);

    // Obtener badge config para la parada actual
    const getBadgeConfig = (statusId?: number, statusText?: string) => {
      const id = statusId ?? 1;
      const text = statusText ?? 'pendiente';
      
      if (id === 7 || ['7', 'cancelado', 'cancelled'].includes(text.toLowerCase())) {
        return { label: 'Cancelada', color: '#B91C1C', bg: '#FEE2E2', dotColor: '#B91C1C' };
      }
      if (id === 2 || id === 3 || ['2', '3', 'assigned', 'accepted', 'por aceptar', 'aceptado', 'asignado'].includes(text.toLowerCase())) {
        return { label: 'Asignado', color: '#0369A1', bg: '#E0F2FE', dotColor: '#0369A1' };
      }
      if (id === 4 || text.toLowerCase() === 'on_the_way' || text.toLowerCase() === 'en camino') {
        return { label: 'En camino', color: '#15803D', bg: '#DCFCE7', dotColor: '#15803D' };
      }
      return { label: 'Pendiente', color: palette.neutral600, bg: palette.neutral200, dotColor: palette.neutral600 };
    };

    const currentBadge = getBadgeConfig(nextStopOrder.estado_id, nextStopOrder.estado || undefined);
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

        {/* PRÓXIMA PARADA (Si hay una segunda parada) */}
        {secondStopOrder && (() => {
          const nextBadge = getBadgeConfig(secondStopOrder.estado_id, secondStopOrder.estado || undefined);
          return (
            <Surface style={styles.followingStopCard} elevation={1}>
              <Text style={styles.followingStopTitle}>Siguiente parada</Text>
              <View style={styles.followingStopBodyRow}>
                <View style={[styles.followingStopLeftCircle, { backgroundColor: nextBadge.bg }]}>
                  <MaterialCommunityIcons name="map-marker" size={20} color={nextBadge.color} />
                </View>
                <View style={styles.followingStopMiddle}>
                  <View style={styles.followingStopAddressRow}>
                    <Text style={styles.followingStopAddress} numberOfLines={1}>
                      {String(secondStopOrder.direccion_destino || secondStopOrder.destino || '')}
                    </Text>
                    <View style={[styles.statusBadgeSmall, { backgroundColor: nextBadge.bg }]}>
                      <View style={[styles.greenDot, { backgroundColor: nextBadge.dotColor }]} />
                      <Text style={[styles.statusBadgeTextSmall, { color: nextBadge.color }]}>{nextBadge.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.followingStopClient}>
                    Cliente: {String(secondStopOrder.cliente || '')}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={palette.neutral400} />
              </View>
            </Surface>
          );
        })()}

        {/* ENTREGAS RESTANTES (Lista desde la tercera parada) */}
        {remainingStops.length > 2 && (
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
            
            <TouchableOpacity 
              style={styles.viewAllButton} 
              onPress={() => setActiveTab('deliveries')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>Ver todas las entregas v</Text>
            </TouchableOpacity>
          </Surface>
        )}
      </View>
    );
  }

  // Lógica de cálculo de estadísticas para administrador
  const totalOrders = workspace.orders.length;

  const countDeliveredToday = workspace.orders.filter(order => {
    const isCompleted = order.estado_id === 5 || order.estado === 'realizado' || order.estado === 'entregado';
    if (!isCompleted) return false;
    if (!order.updated_at) return false;
    const d = new Date(order.updated_at as string);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  }).length;

  const countOnWay = workspace.orders.filter(order => order.estado_id === 4 || order.estado === 'en camino' || order.estado === 'on_the_way').length;
  const countPending = workspace.orders.filter(order => order.estado_id === 1 || order.estado_id === 2 || order.estado === 'pendiente' || order.estado === 'aceptado' || order.estado === 'assigned').length;
  const countCancelled = workspace.orders.filter(order => order.estado_id === 7 || order.estado === 'cancelado' || order.estado === 'cancelled').length;
  const countDelivered = workspace.orders.filter(order => order.estado_id === 5 || order.estado === 'realizado' || order.estado === 'entregado' || order.estado === 'delivered').length;
  
  const countOthers = totalOrders - (countOnWay + countPending + countCancelled + countDelivered);

  const segments = [
    { percentage: totalOrders > 0 ? countDelivered / totalOrders : 0, color: palette.success }, // Entregadas (Green)
    { percentage: totalOrders > 0 ? countOnWay / totalOrders : 0, color: palette.secondary },    // En camino (Blue)
    { percentage: totalOrders > 0 ? countPending / totalOrders : 0, color: palette.warning },  // Pendientes (Orange)
    { percentage: totalOrders > 0 ? countCancelled / totalOrders : 0, color: palette.error }, // Canceladas (Red)
    { percentage: totalOrders > 0 ? countOthers / totalOrders : 0, color: palette.neutral500 },   // Otros (Gray)
  ].filter(s => s.percentage > 0);

  // Obtener las notificaciones no leídas reales
  const getRelativeTime = (dateStr: string) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} hr`;

    return 'Ayer';
  };

  const activeAlerts = (workspace.notifications || [])
    .filter((n) => !n.leida)
    .map((n) => ({
      id: n.id,
      title: n.titulo,
      subtitle: n.mensaje,
      time: getRelativeTime(n.created_at),
      type: n.tipo,
    }));

  return (
    <View style={styles.panel}>
      {/* Resumen general */}
      <View style={styles.dashboardSection}>
        <Text variant="titleMedium" style={styles.sectionHeader}>Resumen general</Text>
        <View style={styles.kpiGrid}>
          <View style={styles.kpiRow}>
            <Surface style={styles.kpiCard} elevation={1}>
              <View style={[styles.kpiIconContainer, { backgroundColor: palette.successLight }]}>
                <IconButton icon="check-circle-outline" iconColor={palette.success} size={24} style={styles.kpiIcon} />
              </View>
              <Text variant="headlineMedium" style={styles.kpiValue}>{countDeliveredToday}</Text>
              <Text variant="bodySmall" style={styles.kpiLabel}>Completadas hoy</Text>
            </Surface>
            <Surface style={styles.kpiCard} elevation={1}>
              <View style={[styles.kpiIconContainer, { backgroundColor: palette.infoLight }]}>
                <IconButton icon="truck-delivery-outline" iconColor={palette.secondary} size={24} style={styles.kpiIcon} />
              </View>
              <Text variant="headlineMedium" style={styles.kpiValue}>{countOnWay}</Text>
              <Text variant="bodySmall" style={styles.kpiLabel}>En camino</Text>
            </Surface>
          </View>
          <View style={styles.kpiRow}>
            <Surface style={styles.kpiCard} elevation={1}>
              <View style={[styles.kpiIconContainer, { backgroundColor: palette.warningLight }]}>
                <IconButton icon="clock-outline" iconColor={palette.warning} size={24} style={styles.kpiIcon} />
              </View>
              <Text variant="headlineMedium" style={styles.kpiValue}>{countPending}</Text>
              <Text variant="bodySmall" style={styles.kpiLabel}>Pendientes</Text>
            </Surface>
            <Surface style={styles.kpiCard} elevation={1}>
              <View style={[styles.kpiIconContainer, { backgroundColor: palette.errorLight }]}>
                <IconButton icon="close-circle-outline" iconColor={palette.error} size={24} style={styles.kpiIcon} />
              </View>
              <Text variant="headlineMedium" style={styles.kpiValue}>{countCancelled}</Text>
              <Text variant="bodySmall" style={styles.kpiLabel}>Canceladas</Text>
            </Surface>
          </View>
        </View>
      </View>

      {/* Entregas por estado */}
      <View style={styles.dashboardSection}>
        <Text variant="titleMedium" style={styles.sectionHeader}>Entregas por estado</Text>
        <Surface style={styles.chartCard} elevation={1}>
          <DonutChart segments={segments} total={totalOrders} />
          
          <View style={styles.legendContainer}>
            <LegendItem label="Entregadas" count={countDelivered} percentage={totalOrders > 0 ? Math.round((countDelivered / totalOrders) * 100) : 0} color={palette.success} />
            <LegendItem label="En camino" count={countOnWay} percentage={totalOrders > 0 ? Math.round((countOnWay / totalOrders) * 100) : 0} color={palette.secondary} />
            <LegendItem label="Pendientes" count={countPending} percentage={totalOrders > 0 ? Math.round((countPending / totalOrders) * 100) : 0} color={palette.warning} />
            <LegendItem label="Canceladas" count={countCancelled} percentage={totalOrders > 0 ? Math.round((countCancelled / totalOrders) * 100) : 0} color={palette.error} />
            {countOthers > 0 && (
              <LegendItem label="Otros" count={countOthers} percentage={totalOrders > 0 ? Math.round((countOthers / totalOrders) * 100) : 0} color={palette.neutral500} />
            )}
          </View>
        </Surface>
      </View>

      {/* Alertas activas */}
      <View style={styles.dashboardSection}>
        <View style={styles.sectionHeaderRow}>
          <Text variant="titleMedium" style={styles.sectionHeader}>Alertas activas</Text>
          {activeAlerts.length > 0 && (
            <TouchableOpacity onPress={() => setActiveTab('notifications')}>
              <Text variant="labelLarge" style={styles.alertLinkText}>Ver todas</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {activeAlerts.length === 0 ? (
          <Surface style={styles.alertCardEmpty} elevation={1}>
            <IconButton icon="check-circle-outline" iconColor={palette.success} size={24} />
            <Text variant="bodyMedium" style={styles.alertEmptyText}>Sin alertas activas</Text>
            <Text variant="bodySmall" style={styles.mutedText}>Todos los pedidos y choferes al día.</Text>
          </Surface>
        ) : (
          activeAlerts.slice(0, 3).map(alert => (
            <TouchableOpacity key={alert.id} activeOpacity={0.8} onPress={() => setActiveTab('notifications')}>
              <Surface style={styles.alertCard} elevation={1}>
                <IconButton 
                  icon={alert.type === 'error' ? 'alert-circle-outline' : alert.type === 'warning' ? 'alert-outline' : alert.type === 'success' ? 'check-circle-outline' : 'information-outline'} 
                  iconColor={alert.type === 'error' ? palette.error : alert.type === 'warning' ? palette.warning : alert.type === 'success' ? palette.success : palette.secondary} 
                  size={22} 
                  style={styles.alertIcon} 
                />
                <View style={styles.alertContent}>
                  <Text variant="bodyMedium" style={styles.alertTitleText}>{alert.title}</Text>
                  <Text variant="bodySmall" style={styles.mutedText}>{alert.subtitle}</Text>
                  <Text variant="labelSmall" style={styles.alertTimeText}>{alert.time}</Text>
                </View>
                <IconButton icon="chevron-right" size={20} iconColor={palette.neutral400} />
              </Surface>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Acciones rápidas */}
      <View style={styles.dashboardSection}>
        <Text variant="titleMedium" style={styles.sectionHeader}>Acciones rápidas</Text>
        <View style={styles.actionsGrid}>
          <View style={styles.actionsRow}>
            <QuickActionButton 
              label="Nueva entrega" 
              icon="plus-circle-outline" 
              color={palette.secondary} 
              onPress={() => {
                setActiveTab('deliveries');
                setShowDeliveryForm(true);
              }} 
            />
            <QuickActionButton 
              label="Agregar chofer" 
              icon="account-plus-outline" 
              color={palette.success} 
              onPress={() => {
                setActiveTab('drivers');
                setShowDriverForm(true);
              }} 
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    panel: {
      gap: 14,
    },
    summaryCard: {
      padding: 16,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface,
      gap: 4,
    },
    cardTitle: {
      color: theme.colors.onSurface,
      fontWeight: '700',
    },
    primaryText: {
      color: theme.colors.onSurface,
      fontWeight: '700',
    },
    mutedText: {
      color: theme.colors.onSurfaceVariant,
    },
    metricsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    metricCard: {
      flex: 1,
      padding: 14,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface,
    },
    dashboardSection: {
      gap: 10,
      marginTop: 6,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 2,
    },
    sectionHeader: {
      fontWeight: '800',
      color: theme.colors.onSurface,
      fontSize: 16,
    },
    kpiGrid: {
      gap: 10,
    },
    kpiRow: {
      flexDirection: 'row',
      gap: 10,
    },
    kpiCard: {
      flex: 1,
      padding: 16,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    kpiIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    kpiIcon: {
      margin: 0,
    },
    kpiValue: {
      fontWeight: '800',
      color: theme.colors.onSurface,
      lineHeight: 28,
    },
    kpiLabel: {
      color: theme.colors.onSurfaceVariant,
      fontWeight: '500',
    },
    chartCard: {
      padding: 16,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      gap: 16,
    },
    chartContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      marginVertical: 10,
    },
    chartCenterText: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    legendContainer: {
      width: '100%',
      gap: 10,
      borderTopWidth: 1,
      borderColor: theme.colors.outline,
      paddingTop: 16,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    legendLabel: {
      flex: 1,
      color: theme.colors.onSurface,
    },
    alertCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface,
      gap: 8,
    },
    alertCardEmpty: {
      alignItems: 'center',
      padding: 20,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface,
      gap: 4,
    },
    alertIcon: {
      margin: 0,
    },
    alertContent: {
      flex: 1,
      gap: 1,
    },
    actionsGrid: {
      gap: 10,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    actionCard: {
      flex: 1,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
    },
    actionCardTouchableOpacity: {
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chartCenterValue: {
      fontWeight: '800',
      textAlign: 'center',
      lineHeight: 28,
    },
    chartCenterLabel: {
      color: palette.neutral600,
      textAlign: 'center',
      fontSize: 10,
    },
    legendItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    legendItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    legendItemCount: {
      fontWeight: '700',
    },
    legendItemPercentage: {
      color: palette.neutral600,
    },
    actionButtonIcon: {
      margin: 0,
    },
    actionButtonText: {
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginTop: 4,
    },
    alertLinkText: {
      color: palette.secondary,
      fontWeight: '700',
    },
    alertEmptyText: {
      color: palette.success,
      fontWeight: '700',
    },
    alertTitleText: {
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    alertTimeText: {
      color: palette.neutral500,
      marginTop: 2,
    },
    driverContainer: {
      flex: 1,
      padding: spacing.md,
      gap: spacing.lg,
    },
    nextStopCard: {
      borderRadius: radii.lg,
      padding: spacing.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      position: 'relative',
    },
    nextStopHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    nextStopLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.onSurfaceVariant,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: spacing.xs,
    },
    nextStopAddressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      marginVertical: spacing.sm,
    },
    nextStopAddressContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.xs,
    },
    nextStopAddressText: {
      fontWeight: '900',
      color: theme.colors.onSurface,
      fontSize: 20,
      lineHeight: 26,
    },
    nextStopSubtitle: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginLeft: spacing.lg,
      marginTop: -spacing.xs,
    },
    navigationIconButton: {
      backgroundColor: '#E0E7FF',
      borderRadius: radii.pill,
      margin: 0,
    },
    metricsDivider: {
      height: 1,
      backgroundColor: theme.colors.outline,
      marginVertical: spacing.md,
      opacity: 0.5,
    },
    statsContainerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statBox: {
      flex: 1,
      alignItems: 'center',
    },
    statBorder: {
      borderLeftWidth: 1,
      borderColor: '#E5E7EB',
    },
    statValue: {
      fontWeight: '900',
      color: theme.colors.onSurface,
      fontSize: 16,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 10,
      color: theme.colors.onSurfaceVariant,
      textTransform: 'uppercase',
      fontWeight: '600',
    },
    etaText: {
      fontWeight: '900',
      color: theme.colors.onSurface,
      fontSize: 16,
    },
    etaSubText: {
      fontSize: 10,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '600',
    },
    remainingStopsContainer: {
      borderRadius: radii.lg,
      padding: spacing.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      gap: spacing.md,
    },
    remainingTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.onSurfaceVariant,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: spacing.xs,
    },
    remainingList: {
      gap: spacing.sm,
    },
    remainingItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surfaceVariant,
    },
    remainingItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    circleBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
    },
    circleBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.onSurfaceVariant,
    },
    remainingAddressText: {
      fontSize: 14,
      color: theme.colors.onSurface,
      fontWeight: '500',
      flex: 1,
    },
    remainingTimeText: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '500',
    },
    viewAllButton: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: spacing.xs,
    },
    viewAllText: {
      fontWeight: '700',
      color: theme.colors.primary,
      fontSize: 14,
    },
    navigateBottomButton: {
      marginVertical: spacing.sm,
    },
    completedStateCard: {
      borderRadius: radii.lg,
      padding: spacing.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
    },
    completedTitleText: {
      fontWeight: '900',
      color: theme.colors.onSurface,
      textAlign: 'center',
    },
    completedSubtitleText: {
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: radii.sm,
      alignSelf: 'flex-start',
    },
    statusBadgeText: {
      fontSize: 12,
      fontWeight: '700',
    },
    currentStopActionBox: {
      marginTop: spacing.xs,
      marginBottom: spacing.xs,
    },
    btnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      width: '100%',
    },
    deliveryProgressForm: {
      gap: spacing.sm,
      width: '100%',
    },
    dniInputHome: {
      backgroundColor: '#FFFFFF',
      height: 48,
      fontSize: 14,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 6,
    },
    navigationIconButtonCircular: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#EFF6FF',
    },
    followingStopCard: {
      borderRadius: radii.lg,
      padding: spacing.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      marginTop: spacing.md,
    },
    followingStopHeader: {
      marginBottom: spacing.xs,
    },
    followingStopTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: '#1D4ED8',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    followingStopBodyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    followingStopLeftCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#EFF6FF',
    },
    followingStopMiddle: {
      flex: 1,
    },
    followingStopAddressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    followingStopAddress: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.onSurface,
      flex: 1,
    },
    statusBadgeSmall: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: radii.sm,
    },
    statusBadgeTextSmall: {
      fontSize: 10,
      fontWeight: '700',
      color: '#15803D',
    },
    greenDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#15803D',
      marginRight: 4,
    },
    followingStopClient: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
  });
