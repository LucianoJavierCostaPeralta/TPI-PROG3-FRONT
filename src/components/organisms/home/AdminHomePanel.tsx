import { View, TouchableOpacity } from 'react-native';
import { Text, IconButton, Surface, useTheme, type MD3Theme } from 'react-native-paper';
import { type AppWorkspace, type HomeTabKey } from '../../../types/workspace';
import { createStyles } from './HomePanel.styles';
import { DonutChart, LegendItem, QuickActionButton } from './HomeDashboardWidgets';

type AdminHomePanelProps = {
  workspace: AppWorkspace;
  setActiveTab: (tab: HomeTabKey) => void;
  setShowDeliveryForm: (show: boolean) => void;
  setShowDriverForm: (show: boolean) => void;
};

export function AdminHomePanel({
  workspace,
  setActiveTab,
  setShowDeliveryForm,
  setShowDriverForm,
}: AdminHomePanelProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

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
  { percentage: totalOrders > 0 ? countDelivered / totalOrders : 0, color: theme.colors.secondary },
  { percentage: totalOrders > 0 ? countOnWay / totalOrders : 0, color: theme.colors.primary },
  { percentage: totalOrders > 0 ? countPending / totalOrders : 0, color: theme.colors.tertiary },
  { percentage: totalOrders > 0 ? countCancelled / totalOrders : 0, color: theme.colors.error },
  { percentage: totalOrders > 0 ? countOthers / totalOrders : 0, color: theme.colors.onSurfaceVariant },
].filter((s) => s.percentage > 0);

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
            <View style={[styles.kpiIconContainer, { backgroundColor: theme.colors.secondaryContainer }]}>
              <IconButton icon="check-circle-outline" iconColor={theme.colors.secondary} size={24} style={styles.kpiIcon} />
            </View>
            <Text variant="headlineMedium" style={styles.kpiValue}>{countDeliveredToday}</Text>
            <Text variant="bodySmall" style={styles.kpiLabel}>Completadas hoy</Text>
          </Surface>
          <Surface style={styles.kpiCard} elevation={1}>
            <View style={[styles.kpiIconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
              <IconButton icon="truck-delivery-outline" iconColor={theme.colors.primary} size={24} style={styles.kpiIcon} />
            </View>
            <Text variant="headlineMedium" style={styles.kpiValue}>{countOnWay}</Text>
            <Text variant="bodySmall" style={styles.kpiLabel}>En camino</Text>
          </Surface>
        </View>
        <View style={styles.kpiRow}>
          <Surface style={styles.kpiCard} elevation={1}>
            <View style={[styles.kpiIconContainer, { backgroundColor: theme.colors.tertiaryContainer }]}>
              <IconButton icon="clock-outline" iconColor={theme.colors.tertiary} size={24} style={styles.kpiIcon} />
            </View>
            <Text variant="headlineMedium" style={styles.kpiValue}>{countPending}</Text>
            <Text variant="bodySmall" style={styles.kpiLabel}>Pendientes</Text>
          </Surface>
          <Surface style={styles.kpiCard} elevation={1}>
            <View style={[styles.kpiIconContainer, { backgroundColor: theme.colors.errorContainer }]}>
              <IconButton icon="close-circle-outline" iconColor={theme.colors.error} size={24} style={styles.kpiIcon} />
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
          <LegendItem label="Entregadas" count={countDelivered} percentage={totalOrders > 0 ? Math.round((countDelivered / totalOrders) * 100) : 0} color={theme.colors.secondary} />
          <LegendItem label="En camino" count={countOnWay} percentage={totalOrders > 0 ? Math.round((countOnWay / totalOrders) * 100) : 0} color={theme.colors.primary} />
          <LegendItem label="Pendientes" count={countPending} percentage={totalOrders > 0 ? Math.round((countPending / totalOrders) * 100) : 0} color={theme.colors.tertiary} />
          <LegendItem label="Canceladas" count={countCancelled} percentage={totalOrders > 0 ? Math.round((countCancelled / totalOrders) * 100) : 0} color={theme.colors.error} />
          {countOthers > 0 && (
            <LegendItem label="Otros" count={countOthers} percentage={totalOrders > 0 ? Math.round((countOthers / totalOrders) * 100) : 0} color={theme.colors.onSurfaceVariant} />
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
          <IconButton icon="check-circle-outline" iconColor={theme.colors.secondary} size={24} />
          <Text variant="bodyMedium" style={styles.alertEmptyText}>Sin alertas activas</Text>
          <Text variant="bodySmall" style={styles.mutedText}>Todos los pedidos y choferes al día.</Text>
        </Surface>
      ) : (
        activeAlerts.slice(0, 3).map(alert => (
          <TouchableOpacity key={alert.id} activeOpacity={0.8} onPress={() => setActiveTab('notifications')}>
            <Surface style={styles.alertCard} elevation={1}>
              <IconButton 
                icon={alert.type === 'error' ? 'alert-circle-outline' : alert.type === 'warning' ? 'alert-outline' : alert.type === 'success' ? 'check-circle-outline' : 'information-outline'} 
                iconColor={alert.type === 'error' ? theme.colors.error : alert.type === 'warning' ? theme.colors.tertiary : alert.type === 'success' ? theme.colors.secondary : theme.colors.primary} 
                size={22} 
                style={styles.alertIcon} 
              />
              <View style={styles.alertContent}>
                <Text variant="bodyMedium" style={styles.alertTitleText}>{alert.title}</Text>
                <Text variant="bodySmall" style={styles.mutedText}>{alert.subtitle}</Text>
                <Text variant="labelSmall" style={styles.alertTimeText}>{alert.time}</Text>
              </View>
              <IconButton icon="chevron-right" size={20} iconColor={theme.colors.outline} />
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
            color={theme.colors.primary} 
            onPress={() => {
              setActiveTab('deliveries');
              setShowDeliveryForm(true);
            }} 
          />
          <QuickActionButton 
            label="Agregar chofer" 
            icon="account-plus-outline" 
            color={theme.colors.secondary} 
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
