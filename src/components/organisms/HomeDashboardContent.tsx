import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, Text, useTheme, type MD3Theme } from 'react-native-paper';
import { AdminsPanel } from './AdminsPanel';
import { DeliveriesPanel } from './DeliveriesPanel';
import { DeliveryDetailPanel } from './DeliveryDetailPanel';
import { DeliveryEditPanel } from './DeliveryEditPanel';
import { DriversPanel } from './DriversPanel';
import { HomePanel } from './HomePanel';
import { MapPanel } from './MapPanel';
import { NotificationsPanel } from './NotificationsPanel';
import { type useHomeDashboard } from '../../hooks/useHomeDashboard';

type HomeDashboardContentProps = ReturnType<typeof useHomeDashboard>;

export function HomeDashboardContent(props: HomeDashboardContentProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  if (props.loading) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator />
        <Text variant="bodyMedium" style={styles.mutedText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screenBody}>
      {props.error ? <Text style={styles.errorText}>{props.error}</Text> : null}

      {props.activeTab === 'home' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={props.refreshing} onRefresh={() => void props.loadWorkspace(true)} />
          }
        >
          <HomePanel
            workspace={props.workspace}
            setActiveTab={props.setActiveTab}
            setShowDeliveryForm={props.setShowDeliveryForm}
            setShowDriverForm={props.setShowDriverForm}
            setDeliveryFilter={props.setDeliveryFilter}
            onUpdateStatus={props.handleUpdateOrderStatus}
            updatingOrderId={props.updatingOrderId}
          />
        </ScrollView>
      ) : null}

      {props.activeTab === 'admins' ? (
        <AdminsPanel
          admins={props.workspace.admins}
          refreshing={props.refreshing}
          onRefresh={() => void props.loadWorkspace(true)}
        />
      ) : null}

      {props.activeTab === 'drivers' ? (
        <DriversPanel
          form={props.driverForm}
          drivers={props.workspace.drivers}
          orders={props.workspace.orders}
          saving={props.savingDriver}
          showForm={props.showDriverForm}
          filter={props.driverFilter}
          canCreate={props.workspace.profile.rol === 'administrador'}
          onFilterChange={props.setDriverFilter}
          onChange={props.updateDriverField}
          onSubmit={props.handleCreateDriver}
          onCancel={() => props.setShowDriverForm(false)}
          onDelete={props.handleDeleteDriver}
          refreshing={props.refreshing}
          onRefresh={() => void props.loadWorkspace(true)}
          selectedDriver={props.selectedDriver}
          setSelectedDriver={props.setSelectedDriver}
        />
      ) : null}

      {props.activeTab === 'deliveries' ? (
        props.isEditingDelivery && props.selectedDelivery ? (
          <DeliveryEditPanel
            form={props.deliveryForm}
            drivers={props.workspace.drivers}
            onChange={props.updateDeliveryField}
            onSubmit={props.handleEditDelivery}
            onCancel={props.cancelEditingDelivery}
            saving={props.savingDelivery}
          />
        ) : props.selectedDelivery ? (
          <DeliveryDetailPanel
            order={props.selectedDelivery}
            drivers={props.workspace.drivers}
            role={props.workspace.profile.rol}
            onEdit={props.startEditingDelivery}
            onUpdateStatus={props.handleUpdateOrderStatus}
            onViewOnMap={() => props.setActiveTab('map')}
            updatingOrderId={props.updatingOrderId}
          />
        ) : (
          <DeliveriesPanel
            role={props.workspace.profile.rol}
            form={props.deliveryForm}
            orders={props.workspace.orders}
            drivers={props.workspace.drivers}
            assigningOrderId={props.assigningOrderId}
            updatingOrderId={props.updatingOrderId}
            filter={props.deliveryFilter}
            saving={props.savingDelivery}
            showForm={props.showDeliveryForm}
            onFilterChange={props.setDeliveryFilter}
            onChange={props.updateDeliveryField}
            onSubmit={props.handleCreateDelivery}
            onCancel={props.cancelDeliveryForm}
            onAssign={props.handleAssignDriver}
            onUpdateStatus={props.handleUpdateOrderStatus}
            refreshing={props.refreshing}
            onRefresh={() => void props.loadWorkspace(true)}
            setSelectedDelivery={props.setSelectedDelivery}
          />
        )
      ) : null}

      {props.activeTab === 'map' ? (
        <MapPanel workspace={props.workspace} initialFocusOrderId={props.selectedDelivery?.id} />
      ) : null}

      {props.activeTab === 'notifications' ? (
        <NotificationsPanel
          notifications={props.workspace.notifications}
          onMarkAsRead={props.handleMarkAsRead}
          onMarkAllAsRead={props.handleMarkAllAsRead}
        />
      ) : null}

      {props.workspace.profile.rol === 'administrador' && props.activeTab === 'drivers' ? (
        <FAB
          icon={props.showDriverForm ? 'close' : 'plus'}
          style={styles.fab}
          onPress={() => props.setShowDriverForm((visible) => !visible)}
        />
      ) : null}

      {props.workspace.profile.rol === 'administrador' && props.activeTab === 'deliveries' ? (
        <FAB
          icon={props.showDeliveryForm ? 'close' : 'plus'}
          style={styles.fab}
          onPress={props.toggleDeliveryForm}
        />
      ) : null}
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    screenBody: {
      flex: 1,
    },
    loadingState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      padding: 24,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 96,
    },
    errorText: {
      color: theme.colors.error,
      fontWeight: '600',
      marginBottom: 10,
    },
    mutedText: {
      color: theme.colors.onSurfaceVariant,
    },
    fab: {
      position: 'absolute',
      right: 18,
      bottom: 18,
      backgroundColor: theme.colors.primary,
    },
  });
