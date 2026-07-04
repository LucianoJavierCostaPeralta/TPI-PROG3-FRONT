import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Text, IconButton, Surface, useTheme, type MD3Theme } from 'react-native-paper';
import { type AppWorkspace, type HomeTabKey, type DeliveryFilter } from '../../screens/HomeScreen';
import { radii } from '../../styles/theme';

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
            stroke="#E7ECF2"
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
              <Circle
                key={index}
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(${rotation} 60 60)`}
              />
            );
          })}
        </G>
      </Svg>
      <View style={styles.chartCenterText}>
        <Text variant="headlineMedium" style={{ fontWeight: '800', textAlign: 'center', lineHeight: 28 }}>
          {total}
        </Text>
        <Text variant="labelSmall" style={{ color: '#64748B', textAlign: 'center', fontSize: 10 }}>
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
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <Text variant="bodyMedium" style={styles.legendLabel}>{label}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Text variant="bodyMedium" style={{ fontWeight: '700' }}>{count}</Text>
        <Text variant="bodySmall" style={{ color: '#64748B' }}>({percentage}%)</Text>
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
        <IconButton icon={icon} iconColor={color} size={28} style={{ margin: 0 }} />
        <Text variant="labelLarge" style={{ fontWeight: '700', color: theme.colors.onSurface, marginTop: 4 }}>{label}</Text>
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
}: {
  workspace: AppWorkspace;
  setActiveTab: (tab: HomeTabKey) => void;
  setShowDeliveryForm: (show: boolean) => void;
  setShowDriverForm: (show: boolean) => void;
  setDeliveryFilter: (filter: DeliveryFilter) => void;
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
    const pendingOrders = workspace.orders.filter((order) => order.estado !== 'realizado').length;

    return (
      <View style={styles.panel}>
        <Surface style={styles.summaryCard} elevation={1}>
          <Text variant="titleMedium" style={styles.cardTitle}>Chofer</Text>
          <Text variant="headlineSmall" style={styles.primaryText}>{workspace.profile.nombre}</Text>
          <Text variant="bodyMedium" style={styles.mutedText}>{workspace.company?.nombre ?? 'Empresa sin datos'}</Text>
        </Surface>
        <View style={styles.metricsRow}>
          <Metric label="Pendientes" value={pendingOrders} />
          <Metric label="Realizados" value={workspace.orders.length - pendingOrders} />
        </View>
      </View>
    );
  }

  // Lógica de cálculo de estadísticas para administrador
  const totalOrders = workspace.orders.length;

  const countToday = workspace.orders.filter(order => {
    if (!order.created_at) return false;
    const d = new Date(order.created_at);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  }).length;

  const countOnWay = workspace.orders.filter(order => order.estado_id === 4 || order.estado === 'en camino').length;
  const countPending = workspace.orders.filter(order => order.estado_id === 1 || order.estado === 'pendiente').length;
  const countCancelled = workspace.orders.filter(order => order.estado_id === 7 || order.estado === 'cancelado').length;
  const countDelivered = workspace.orders.filter(order => order.estado_id === 5 || order.estado === 'realizado' || order.estado === 'entregado').length;
  
  const countOthers = totalOrders - (countOnWay + countPending + countCancelled + countDelivered);

  const segments = [
    { percentage: totalOrders > 0 ? countDelivered / totalOrders : 0, color: '#09C46B' }, // Entregadas (Green)
    { percentage: totalOrders > 0 ? countOnWay / totalOrders : 0, color: '#2388F2' },    // En camino (Blue)
    { percentage: totalOrders > 0 ? countPending / totalOrders : 0, color: '#FF9F2E' },  // Pendientes (Orange)
    { percentage: totalOrders > 0 ? countCancelled / totalOrders : 0, color: '#FF334B' }, // Canceladas (Red)
    { percentage: totalOrders > 0 ? countOthers / totalOrders : 0, color: '#94A3B8' },   // Otros (Gray)
  ].filter(s => s.percentage > 0);

  // Alertas dinámicas basadas en datos reales
  const activeAlerts: Array<{ id: string; title: string; subtitle: string; time: string; type: 'warning' | 'info' | 'error' }> = [];

  // Alert 1: Pedidos sin chofer asignado (Pendientes críticos)
  const unassignedOrders = workspace.orders.filter(o => !o.chofer_id);
  unassignedOrders.slice(0, 2).forEach(order => {
    activeAlerts.push({
      id: `unassigned-${order.id}`,
      title: `Entrega a ${order.cliente} sin chofer`,
      subtitle: `Destino: ${order.destino || order.direccion_destino}`,
      time: 'Hace un momento',
      type: 'warning',
    });
  });

  // Alert 2: Choferes inactivos
  const inactiveDrivers = workspace.drivers.filter(d => !d.activo);
  inactiveDrivers.slice(0, 2).forEach(driver => {
    activeAlerts.push({
      id: `inactive-${driver.id}`,
      title: `Chofer ${driver.nombre} inactivo`,
      subtitle: 'Debe ser activado para asignarle entregas',
      time: 'Hoy, 08:30',
      type: 'error',
    });
  });

  // Alert 3: Pedido pendiente de aceptación
  const pendingOldOrders = workspace.orders.filter(o => (o.estado_id === 1 || o.estado === 'pendiente') && o.chofer_id);
  pendingOldOrders.slice(0, 1).forEach(order => {
    activeAlerts.push({
      id: `pending-${order.id}`,
      title: `Entrega #${order.id.slice(0, 6).toUpperCase()} pendiente`,
      subtitle: `Asignado a: ${(order.chofer as any)?.nombre_completo ?? (order.chofer as any)?.nombre ?? 'Chofer'}`,
      time: 'Hoy, 09:15',
      type: 'info',
    });
  });

  return (
    <View style={styles.panel}>
      {/* Resumen general */}
      <View style={styles.dashboardSection}>
        <Text variant="titleMedium" style={styles.sectionHeader}>Resumen general</Text>
        <View style={styles.kpiGrid}>
          <View style={styles.kpiRow}>
            <Surface style={styles.kpiCard} elevation={1}>
              <View style={[styles.kpiIconContainer, { backgroundColor: '#E8F8EF' }]}>
                <IconButton icon="check-circle-outline" iconColor="#09C46B" size={24} style={styles.kpiIcon} />
              </View>
              <Text variant="headlineMedium" style={styles.kpiValue}>{countToday}</Text>
              <Text variant="bodySmall" style={styles.kpiLabel}>Entregas hoy</Text>
            </Surface>
            <Surface style={styles.kpiCard} elevation={1}>
              <View style={[styles.kpiIconContainer, { backgroundColor: '#EAF3FF' }]}>
                <IconButton icon="truck-delivery-outline" iconColor="#2388F2" size={24} style={styles.kpiIcon} />
              </View>
              <Text variant="headlineMedium" style={styles.kpiValue}>{countOnWay}</Text>
              <Text variant="bodySmall" style={styles.kpiLabel}>En camino</Text>
            </Surface>
          </View>
          <View style={styles.kpiRow}>
            <Surface style={styles.kpiCard} elevation={1}>
              <View style={[styles.kpiIconContainer, { backgroundColor: '#FFF4E4' }]}>
                <IconButton icon="clock-outline" iconColor="#FF9F2E" size={24} style={styles.kpiIcon} />
              </View>
              <Text variant="headlineMedium" style={styles.kpiValue}>{countPending}</Text>
              <Text variant="bodySmall" style={styles.kpiLabel}>Pendientes</Text>
            </Surface>
            <Surface style={styles.kpiCard} elevation={1}>
              <View style={[styles.kpiIconContainer, { backgroundColor: '#FFE8EB' }]}>
                <IconButton icon="close-circle-outline" iconColor="#FF334B" size={24} style={styles.kpiIcon} />
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
            <LegendItem label="Entregadas" count={countDelivered} percentage={totalOrders > 0 ? Math.round((countDelivered / totalOrders) * 100) : 0} color="#09C46B" />
            <LegendItem label="En camino" count={countOnWay} percentage={totalOrders > 0 ? Math.round((countOnWay / totalOrders) * 100) : 0} color="#2388F2" />
            <LegendItem label="Pendientes" count={countPending} percentage={totalOrders > 0 ? Math.round((countPending / totalOrders) * 100) : 0} color="#FF9F2E" />
            <LegendItem label="Canceladas" count={countCancelled} percentage={totalOrders > 0 ? Math.round((countCancelled / totalOrders) * 100) : 0} color="#FF334B" />
            {countOthers > 0 && (
              <LegendItem label="Otros" count={countOthers} percentage={totalOrders > 0 ? Math.round((countOthers / totalOrders) * 100) : 0} color="#94A3B8" />
            )}
          </View>
        </Surface>
      </View>

      {/* Alertas activas */}
      <View style={styles.dashboardSection}>
        <View style={styles.sectionHeaderRow}>
          <Text variant="titleMedium" style={styles.sectionHeader}>Alertas activas</Text>
          {activeAlerts.length > 0 && (
            <TouchableOpacity onPress={() => setActiveTab('deliveries')}>
              <Text variant="labelLarge" style={{ color: '#2388F2', fontWeight: '700' }}>Ver todas</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {activeAlerts.length === 0 ? (
          <Surface style={styles.alertCardEmpty} elevation={1}>
            <IconButton icon="check-circle-outline" iconColor="#09C46B" size={24} />
            <Text variant="bodyMedium" style={{ color: '#09C46B', fontWeight: '700' }}>Sin alertas activas</Text>
            <Text variant="bodySmall" style={styles.mutedText}>Todos los pedidos y choferes al día.</Text>
          </Surface>
        ) : (
          activeAlerts.slice(0, 3).map(alert => (
            <Surface key={alert.id} style={styles.alertCard} elevation={1}>
              <IconButton 
                icon={alert.type === 'error' ? 'alert-circle-outline' : alert.type === 'warning' ? 'alert-outline' : 'information-outline'} 
                iconColor={alert.type === 'error' ? '#FF334B' : alert.type === 'warning' ? '#FF9F2E' : '#2388F2'} 
                size={22} 
                style={styles.alertIcon} 
              />
              <View style={styles.alertContent}>
                <Text variant="bodyMedium" style={{ fontWeight: '700', color: theme.colors.onSurface }}>{alert.title}</Text>
                <Text variant="bodySmall" style={styles.mutedText}>{alert.subtitle}</Text>
                <Text variant="labelSmall" style={{ color: '#94A3B8', marginTop: 2 }}>{alert.time}</Text>
              </View>
              <IconButton icon="chevron-right" size={20} iconColor="#CBD5E1" />
            </Surface>
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
              color="#2388F2" 
              onPress={() => {
                setActiveTab('deliveries');
                setShowDeliveryForm(true);
              }} 
            />
            <QuickActionButton 
              label="Agregar chofer" 
              icon="account-plus-outline" 
              color="#09C46B" 
              onPress={() => {
                setActiveTab('drivers');
                setShowDriverForm(true);
              }} 
            />
          </View>
          <View style={styles.actionsRow}>
            <QuickActionButton 
              label="Ver mapa" 
              icon="map-outline" 
              color="#7652C6" 
              onPress={() => {
                setActiveTab('map');
              }} 
            />
            <QuickActionButton 
              label="Reportes" 
              icon="chart-bar" 
              color="#FF9F2E" 
              onPress={() => {
                setActiveTab('deliveries');
                setDeliveryFilter('todos');
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
  });
