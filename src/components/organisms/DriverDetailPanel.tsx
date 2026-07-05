import React from 'react';
import { StyleSheet, View, Alert, ScrollView } from 'react-native';
import { Surface, Text, useTheme, type MD3Theme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { InfoCard } from '../molecules/InfoCard';
import { CTAButton, UserAvatar } from '../atoms';
import { spacing, radii } from '../../styles/theme';
import { type Driver, type DeliveryOrder } from '../../types/workspace';

interface DriverDetailPanelProps {
  driver: Driver;
  orders?: DeliveryOrder[];
  onBack: () => void;
  onDelete?: (driverId: string) => void;
}

export function DriverDetailPanel({ driver, orders, onBack, onDelete }: DriverDetailPanelProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  const vehicle = driver.vehiculo ?? driver.vehicle ?? driver.patente ?? 'No especificado';
  const zone = driver.zona ?? driver.zone ?? 'No especificada';

  const formatDateForDisplay = (value?: string | null) => {
    if (!value) return 'No especificada';
    const cleanValue = value.split('T')[0];
    if (!cleanValue) return 'No especificada';
    const parts = cleanValue.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return cleanValue;
  };

  const driverOrders = (orders || []).filter(o => o.chofer_id === driver.id);
  const totalDeliveries = driverOrders.length;
  const completedDeliveries = driverOrders.filter(o => 
    o.estado_id === 5 || 
    o.estado_id === 6 || 
    ['realizado', 'entregado', 'entregada', 'delivered', 'finalizado'].includes(String(o.estado || '').toLowerCase())
  ).length;
  const inProgressDeliveries = driverOrders.filter(o => 
    o.estado_id === 4 || 
    ['en camino', 'en_camino', 'on the way', 'on_the_way'].includes(String(o.estado || '').toLowerCase())
  ).length;
  const pendingDeliveries = driverOrders.filter(o => 
    o.estado_id === 2 || 
    o.estado_id === 3 || 
    ['asignado', 'aceptado', 'assigned', 'accepted'].includes(String(o.estado || '').toLowerCase())
  ).length;

  const handleDeletePress = () => {
    Alert.alert(
      'Eliminar Chofer',
      `¿Estás seguro de que deseas eliminar a ${driver.nombre}? Esta acción no se puede deshacer.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              onDelete(driver.id);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarContainer}>
          <UserAvatar name={driver.nombre} size={80} />
          <Text variant="headlineSmall" style={styles.userName}>
            {driver.nombre}
          </Text>
          <View style={styles.roleBadge}>
            <Text variant="labelMedium" style={styles.roleBadgeText}>
              Chofer
            </Text>
          </View>
        </View>

        {/* Sección de Rendimiento */}
        <View style={styles.statsContainer}>
          <Text variant="titleMedium" style={styles.statsTitle}>Rendimiento del Chofer</Text>
          
          <View style={styles.statsGrid}>
            {/* Tarjeta 1: Completadas */}
            <Surface style={[styles.statCard, { backgroundColor: '#DCFCE7', borderColor: '#166534' }]} elevation={1}>
              <View style={styles.statCardHeader}>
                <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={24} color="#166534" />
                <Text style={[styles.statValue, { color: '#166534' }]}>{completedDeliveries}</Text>
              </View>
              <Text style={[styles.statLabel, { color: '#166534' }]}>Entregadas</Text>
            </Surface>

            {/* Tarjeta 2: En Camino */}
            <Surface style={[styles.statCard, { backgroundColor: '#E0F2FE', borderColor: '#075985' }]} elevation={1}>
              <View style={styles.statCardHeader}>
                <MaterialCommunityIcons name="truck-delivery-outline" size={24} color="#075985" />
                <Text style={[styles.statValue, { color: '#075985' }]}>{inProgressDeliveries}</Text>
              </View>
              <Text style={[styles.statLabel, { color: '#075985' }]}>En camino</Text>
            </Surface>
          </View>

          <View style={[styles.statsGrid, { marginTop: spacing.md }]}>
            {/* Tarjeta 3: Pendientes */}
            <Surface style={[styles.statCard, { backgroundColor: '#FEF3C7', borderColor: '#9A3412' }]} elevation={1}>
              <View style={styles.statCardHeader}>
                <MaterialCommunityIcons name="clock-outline" size={24} color="#9A3412" />
                <Text style={[styles.statValue, { color: '#9A3412' }]}>{pendingDeliveries}</Text>
              </View>
              <Text style={[styles.statLabel, { color: '#9A3412' }]}>Pendientes</Text>
            </Surface>

            {/* Tarjeta 4: Total */}
            <Surface style={[styles.statCard, { backgroundColor: '#F1F5F9', borderColor: '#475569' }]} elevation={1}>
              <View style={styles.statCardHeader}>
                <MaterialCommunityIcons name="clipboard-list-outline" size={24} color="#475569" />
                <Text style={[styles.statValue, { color: '#475569' }]}>{totalDeliveries}</Text>
              </View>
              <Text style={[styles.statLabel, { color: '#475569' }]}>Total Asignadas</Text>
            </Surface>
          </View>
        </View>

        <Surface style={styles.section} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Datos Personales</Text>
          <View style={styles.infoList}>
            <InfoCard
              icon="account-outline"
              title="Nombre completo"
              description={driver.nombre}
            />
            <View style={styles.itemDivider} />
            <InfoCard
              icon="email-outline"
              title="Correo electrónico"
              description={driver.email || 'No especificado'}
            />
            <View style={styles.itemDivider} />
            <InfoCard
              icon="phone-outline"
              title="Número de teléfono"
              description={driver.telefono || 'No especificado'}
            />
            <View style={styles.itemDivider} />
            <InfoCard
              icon="card-account-details-outline"
              title="DNI"
              description={driver.documento || 'No especificado'}
            />
            <View style={styles.itemDivider} />
            <InfoCard
              icon="calendar-range"
              title="Fecha de nacimiento"
              description={formatDateForDisplay(driver.fecha_nacimiento)}
            />
            <View style={styles.itemDivider} />
            <InfoCard
              icon="truck-outline"
              title="Vehículo"
              description={String(vehicle)}
            />
            <View style={styles.itemDivider} />
            <InfoCard
              icon="map-marker-outline"
              title="Zona de reparto"
              description={String(zone)}
            />
            <View style={styles.itemDivider} />
            <InfoCard
              icon="toggle-switch-outline"
              title="Estado de la cuenta"
              description={driver.activo ? 'Activo' : 'Inactivo'}
            />
          </View>
        </Surface>

        {onDelete && (
          <View style={styles.actionsContainer}>
            <CTAButton
              variant="destructive"
              onPress={handleDeletePress}
              style={styles.actionButton}
            >
              Eliminar Chofer
            </CTAButton>
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
    statsContainer: {
      marginBottom: spacing.xl,
    },
    statsTitle: {
      color: theme.colors.onSurface,
      fontWeight: '700',
      marginBottom: spacing.md,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    statCard: {
      flex: 1,
      borderRadius: radii.md,
      padding: spacing.md,
      borderWidth: 1,
    },
    statCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '800',
    },
    statLabel: {
      fontSize: 12,
      fontWeight: '600',
    },
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: spacing.xxxl,
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: spacing.xl,
      marginTop: spacing.md,
    },
    userName: {
      color: theme.colors.onSurface,
      fontWeight: '700',
      textAlign: 'center',
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    roleBadge: {
      backgroundColor: theme.colors.secondaryContainer,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 16,
    },
    roleBadgeText: {
      color: theme.colors.onSecondaryContainer,
      fontWeight: '600',
    },
    section: {
      borderRadius: radii.md,
      padding: spacing.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      marginBottom: 24,
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
    actionsContainer: {
      marginBottom: spacing.xl,
      gap: spacing.md,
    },
    actionButton: {
      width: '100%',
    },
  });
