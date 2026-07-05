import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Surface, Text, useTheme, type MD3Theme } from 'react-native-paper';
import { InfoCard } from '../molecules/InfoCard';
import { CTAButton, UserAvatar } from '../atoms';
import { spacing, radii, palette } from '../../styles/theme';
import {
  type Driver,
  type DeliveryOrder,
  normalizeOrderStatus,
  getBackendStatusLabel,
  formatOrderDate,
  getOrderField,
  getOrderProducts,
} from '../../types/workspace';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DeliveryDetailPanelProps {
  order: DeliveryOrder;
  drivers: Driver[];
  role: 'administrador' | 'asesor' | 'chofer';
  onEdit: () => void;
}

export function DeliveryDetailPanel({
  order,
  drivers,
  role,
  onEdit,
}: DeliveryDetailPanelProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  const currentStatus = normalizeOrderStatus(order.estado_id ?? order.estado);
  const assignedDriver = drivers.find((driver) => driver.usuario_id === order.chofer_id || driver.id === order.chofer_id);

  const getStatusStyle = (status: string) => {
    if (status === 'realizado') return styles.statusBadgeDelivered;
    if (status === 'en camino') return styles.statusBadgeOnWay;
    return styles.statusBadgePending;
  };

  const getStatusTextStyle = (status: string) => {
    if (status === 'realizado') return styles.statusTextDelivered;
    if (status === 'en camino') return styles.statusTextOnWay;
    return styles.statusTextPending;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cabecera del detalle */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.orderId}>
            #{order.id.slice(0, 8).toUpperCase()}
          </Text>
          <View style={[styles.statusBadge, getStatusStyle(currentStatus)]}>
            <Text variant="labelMedium" style={[styles.statusText, getStatusTextStyle(currentStatus)]}>
              {getBackendStatusLabel(order)}
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

        {/* Botón de Edición para el Administrador */}
        {role === 'administrador' && (
          <CTAButton
            variant="primary"
            onPress={onEdit}
            style={styles.editButton}
            icon="pencil-outline"
          >
            Editar datos de entrega
          </CTAButton>
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
      backgroundColor: palette.pendingLightBg,
    },
    statusBadgeOnWay: {
      backgroundColor: palette.infoLightBg,
    },
    statusBadgeDelivered: {
      backgroundColor: palette.successLightBg,
    },
    statusText: {
      fontWeight: '800',
    },
    statusTextPending: {
      color: palette.warning,
    },
    statusTextOnWay: {
      color: palette.secondary,
    },
    statusTextDelivered: {
      color: palette.successDark,
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
    editButton: {
      marginBottom: spacing.xl,
    },
  });
