import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Surface, Text, useTheme, type MD3Theme } from 'react-native-paper';
import { InfoCard } from '../molecules/InfoCard';
import { CTAButton, UserAvatar, TextInputField } from '../atoms';
import { spacing, radii, palette } from '../../styles/theme';
import {
  type Driver,
  type DeliveryOrder,
  normalizeOrderStatus,
  getBackendStatusLabel,
  formatOrderDate,
  getOrderField,
  getOrderProducts,
  ORDER_STATUS,
} from '../../types/workspace';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DeliveryDetailPanelProps {
  order: DeliveryOrder;
  drivers: Driver[];
  role: 'administrador' | 'asesor' | 'chofer';
  onEdit: () => void;
  onDelete?: (orderId: string) => void;
  deleting?: boolean;
  onUpdateStatus?: (orderId: string, action: string, clienteDni?: string) => void;
  onViewOnMap?: (order: DeliveryOrder) => void;
  updatingOrderId?: string | null;
}

export function DeliveryDetailPanel({
  order,
  drivers,
  role,
  onEdit,
  onDelete,
  deleting = false,
  onUpdateStatus,
  onViewOnMap,
  updatingOrderId,
}: DeliveryDetailPanelProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  const [clienteDni, setClienteDni] = useState('');
  const [dniError, setDniError] = useState('');

  const assignedDriver = drivers.find((driver) => driver.usuario_id === order.chofer_id || driver.id === order.chofer_id);

  const getBadgeConfig = (id: number | undefined, nameVal: unknown) => {
    const name = String(nameVal ?? '').toLowerCase();
    if (id === 7 || ['7', 'cancelado', 'cancelled'].includes(name)) {
      return {
        label: 'Cancelada',
        bg: theme.colors.errorContainer,
        text: theme.colors.error,
      };
    }
    if (id === 5 || id === 6 || ['5', '6', 'realizado', 'entregado', 'entregada', 'delivered', 'finalizado'].includes(name)) {
      return {
        label: 'Entregada',
        bg: theme.colors.secondaryContainer,
        text: theme.colors.secondary,
      };
    }
    if (id === 4 || ['4', 'en camino', 'en_camino', 'encamino', 'on the way', 'on_the_way'].includes(name)) {
      return {
        label: 'En camino',
        bg: theme.colors.primaryContainer,
        text: theme.colors.primary,
      };
    }
    if (id === 3 || ['3', 'aceptado', 'accepted'].includes(name)) {
      return {
        label: 'Aceptado',
        bg: theme.colors.primaryContainer,
        text: theme.colors.primary,
      };
    }
    if (id === 2 || ['2', 'asignado', 'assigned'].includes(name)) {
      return {
        label: 'Por aceptar',
        bg: theme.colors.errorContainer,
        text: theme.colors.error,
      };
    }
    return {
      label: 'Pendiente',
      bg: theme.colors.tertiaryContainer,
      text: theme.colors.tertiary,
    };
  };

  const badgeConfig = getBadgeConfig(order.estado_id, order.estado);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cabecera del detalle */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.orderId}>
            #{order.id.slice(0, 8).toUpperCase()}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: badgeConfig.bg }]}>
            <Text variant="labelMedium" style={[styles.statusText, { color: badgeConfig.text }]}>
              {badgeConfig.label}
            </Text>
          </View>
        </View>

        {/* Tarjeta de Información General */}
        <Surface style={styles.section} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Detalles de la Entrega</Text>
          <View style={styles.infoList}>
            <InfoCard
              icon="account-outline"
              title="Cliente"
              description={String(getOrderField(order, ['cliente', 'cliente_nombre', 'nombre_cliente']) || 'No especificado')}
            />
            <View style={styles.itemDivider} />
            {role === 'administrador' && (
              <>
                <InfoCard
                  icon="card-account-details-outline"
                  title="DNI del Cliente"
                  description={String(getOrderField(order, ['cliente_dni', 'dni_cliente']) || 'No especificado')}
                />
                <View style={styles.itemDivider} />
              </>
            )}
            <InfoCard
              icon="map-marker-outline"
              title="Dirección de Destino"
              description={String(getOrderField(order, ['direccion_destino', 'destino']) || 'No especificada')}
            />
            <View style={styles.itemDivider} />
            <InfoCard
              icon="tag-outline"
              title="Referencia de Ubicación"
              description={String(order.referencia || 'Sin referencias')}
            />
            <View style={styles.itemDivider} />
            <InfoCard
              icon="calendar-range"
              title="Fecha Planificada"
              description={formatOrderDate(order) || 'No especificada'}
            />
            <View style={styles.itemDivider} />
            <InfoCard
              icon="truck-delivery-outline"
              title="Chofer Asignado"
              description={assignedDriver ? assignedDriver.nombre : 'Sin asignar'}
            />
            <View style={styles.itemDivider} />
            <InfoCard
              icon="package-variant-closed"
              title="Productos"
              description={String(getOrderProducts(order) || 'No especificados')}
            />
            <View style={styles.itemDivider} />
            <InfoCard
              icon="text-box-outline"
              title="Observaciones"
              description={String(order.observaciones || 'Sin observaciones')}
            />
          </View>
        </Surface>

        {/* Acciones para el Administrador */}
        {role === 'administrador' && (
          <View style={styles.adminActions}>
            <CTAButton
              variant="primary"
              onPress={onEdit}
              style={styles.actionButton}
              icon="pencil-outline"
              disabled={deleting}
            >
              Editar datos de entrega
            </CTAButton>
            <CTAButton
              variant="destructive"
              onPress={() => {
                Alert.alert(
                  'Eliminar entrega',
                  '¿Estás seguro de que deseas eliminar esta entrega? Esta acción no se puede deshacer.',
                  [
                    { text: 'No, volver', style: 'cancel' },
                    {
                      text: 'Eliminar',
                      style: 'destructive',
                      onPress: () => onDelete?.(order.id),
                    },
                  ],
                );
              }}
              style={styles.actionButton}
              icon="delete-outline"
              loading={deleting}
              disabled={deleting}
            >
              Eliminar entrega
            </CTAButton>
          </View>
        )}

        {/* Sección de acciones para el Chofer */}
        {role === 'chofer' && (
          <View style={styles.driverActionsContainer}>
            {order.estado_id === ORDER_STATUS.ASSIGNED && (
              <>
                <CTAButton
                  variant="primary"
                  onPress={() => onUpdateStatus?.(order.id, 'accept')}
                  style={styles.actionButton}
                  loading={updatingOrderId === order.id}
                  disabled={!!updatingOrderId}
                  icon="play-outline"
                >
                  Iniciar entrega
                </CTAButton>

                <CTAButton
                  variant="secondary"
                  onPress={() => onViewOnMap?.(order)}
                  style={styles.actionButton}
                  disabled={!!updatingOrderId}
                  icon="map-marker-outline"
                >
                  Ver en mapa
                </CTAButton>
              </>
            )}

            {order.estado_id === ORDER_STATUS.ACCEPTED && (
              <>
                <CTAButton
                  variant="primary"
                  onPress={() => onUpdateStatus?.(order.id, 'on_the_way')}
                  style={styles.actionButton}
                  loading={updatingOrderId === order.id}
                  disabled={!!updatingOrderId}
                  icon="truck-delivery"
                >
                  Comenzar entrega
                </CTAButton>

                <CTAButton
                  variant="destructive"
                  onPress={() => {
                    Alert.alert(
                      'Cancelar entrega',
                      '¿Estás seguro de que deseas cancelar esta entrega?',
                      [
                        { text: 'No, volver', style: 'cancel' },
                        {
                          text: 'Sí, cancelar',
                          style: 'destructive',
                          onPress: () => onUpdateStatus?.(order.id, 'cancelled'),
                        },
                      ]
                    );
                  }}
                  style={styles.actionButton}
                  disabled={!!updatingOrderId}
                  icon="close"
                >
                  Cancelar entrega
                </CTAButton>

                <CTAButton
                  variant="secondary"
                  onPress={() => onViewOnMap?.(order)}
                  style={styles.actionButton}
                  disabled={!!updatingOrderId}
                  icon="map-marker-outline"
                >
                  Ver en mapa
                </CTAButton>
              </>
            )}

            {order.estado_id === ORDER_STATUS.ON_THE_WAY && (
              <View style={styles.dniVerificationBox}>
                <Text variant="titleMedium" style={styles.dniBoxTitle}>Confirmación de Entrega</Text>
                <Text variant="bodySmall" style={styles.dniBoxSubtitle}>
                  Ingresá los últimos 8 números del DNI del cliente para validar la entrega.
                </Text>
                
                <TextInputField
                  label="DNI del Cliente"
                  placeholder="DNI del receptor"
                  value={clienteDni}
                  onChangeText={(val) => {
                    setClienteDni(val.replace(/[^0-9]/g, '').slice(0, 8));
                    setDniError('');
                  }}
                  keyboardType="number-pad"
                  disabled={updatingOrderId === order.id}
                  icon="card-account-details-outline"
                />
                {!!dniError && (
                  <Text variant="bodySmall" style={styles.errorText}>
                    {dniError}
                  </Text>
                )}

                <CTAButton
                  variant="primary"
                  onPress={() => {
                    if (clienteDni.length < 8) {
                      setDniError('El DNI debe tener 8 dígitos.');
                      return;
                    }
                    onUpdateStatus?.(order.id, 'delivered', clienteDni);
                  }}
                  style={styles.actionButton}
                  loading={updatingOrderId === order.id}
                  disabled={!!updatingOrderId}
                  icon="check-circle-outline"
                >
                  Finalizar entrega
                </CTAButton>

                <CTAButton
                  variant="destructive"
                  onPress={() => {
                    Alert.alert(
                      'Cancelar entrega',
                      '¿Estás seguro de que deseas cancelar esta entrega?',
                      [
                        { text: 'No, volver', style: 'cancel' },
                        {
                          text: 'Sí, cancelar',
                          style: 'destructive',
                          onPress: () => onUpdateStatus?.(order.id, 'cancelled'),
                        },
                      ]
                    );
                  }}
                  style={styles.actionButton}
                  disabled={!!updatingOrderId}
                  icon="close"
                >
                  Cancelar entrega
                </CTAButton>

                <CTAButton
                  variant="secondary"
                  onPress={() => onViewOnMap?.(order)}
                  style={styles.actionButton}
                  disabled={!!updatingOrderId}
                  icon="map-marker-outline"
                >
                  Ver en mapa
                </CTAButton>
              </View>
            )}

            {(order.estado_id === 5 || order.estado_id === 6) && (
              <View style={styles.completedBox}>
                <Surface style={styles.completedCard} elevation={0}>
                  <MaterialCommunityIcons name="check-circle" size={32} color={theme.colors.secondary} />
                  <Text variant="titleMedium" style={styles.completedText}>¡Entrega completada!</Text>
                </Surface>
                
                <CTAButton
                  variant="secondary"
                  onPress={() => onViewOnMap?.(order)}
                  style={styles.actionButton}
                  icon="map-marker-outline"
                >
                  Ver en mapa
                </CTAButton>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: spacing.xxxl,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    orderId: {
      fontWeight: '900',
      color: theme.colors.onSurface,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
    },
    statusBadgePending: {
      backgroundColor: theme.colors.tertiaryContainer,
    },
    statusBadgeOnWay: {
      backgroundColor: theme.colors.primaryContainer,
    },
    statusBadgeDelivered: {
      backgroundColor: theme.colors.secondaryContainer,
    },
    statusText: {
      fontWeight: '800',
    },
    statusTextPending: {
      color: theme.colors.tertiary,
    },
    statusTextOnWay: {
      color: theme.colors.primary,
    },
    statusTextDelivered: {
      color: theme.colors.secondary,
    },
    section: {
      borderRadius: radii.md,
      padding: spacing.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      color: theme.colors.onSurface,
      fontWeight: '700',
      marginBottom: spacing.lg,
    },
    infoList: {
      gap: spacing.md,
    },
    itemDivider: {
      height: 1,
      backgroundColor: theme.colors.outline,
      marginVertical: spacing.xs,
      opacity: 0.2,
    },
    adminActions: {
      marginBottom: spacing.xl,
      gap: spacing.sm,
    },
    driverActionsContainer: {
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    actionButton: {
      marginVertical: spacing.xs,
    },
    dniVerificationBox: {
      padding: spacing.md,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      marginVertical: spacing.md,
      gap: spacing.md,
    },
    dniBoxTitle: {
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    dniBoxSubtitle: {
      color: theme.colors.onSurfaceVariant,
      marginBottom: spacing.xs,
    },
    errorText: {
      color: theme.colors.error,
      fontWeight: '600',
      marginTop: -spacing.xs,
    },
    completedBox: {
      marginVertical: spacing.md,
      gap: spacing.sm,
    },
    completedCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.md,
      borderRadius: radii.md,
      backgroundColor: theme.colors.secondaryContainer,
      borderWidth: 1,
      borderColor: theme.colors.secondary,
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    completedText: {
      fontWeight: '800',
      color: theme.colors.secondary,
    },
  });
