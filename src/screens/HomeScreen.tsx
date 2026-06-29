import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  ActivityIndicator,
  Divider,
  FAB,
  IconButton,
  Surface,
  Text,
  TextInput as PaperTextInput,
  useTheme,
  type MD3Theme,
} from 'react-native-paper';
import { HomeTemplate } from '../components/templates';
import { type BottomTabMenuItem } from '../components/molecules';
import { CTAButton, TextInputField } from '../components/atoms';
import { signOut } from '../lib/auth';
import {
  assignOrderDriver,
  createDelivery,
  createDriver,
  getAppWorkspace,
  updateOrderStatus,
  type AppWorkspace,
  type DeliveryOrder,
  type Driver,
  type UserProfile,
} from '../lib/company';

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }

  return fallback;
}

type HomeScreenProps = {
  navigation?: {
    reset: (state: { index: number; routes: Array<{ name: string }> }) => void;
  };
};

type HomeTabKey = 'home' | 'deliveries' | 'drivers' | 'admins' | 'map';

type DriverFilter = 'activos' | 'inactivos' | 'todos';
type DeliveryFilter = 'todos' | 'pendiente' | 'en camino' | 'realizado';

type DriverForm = {
  nombre: string;
  email: string;
  telefono: string;
  documento: string;
};

type DeliveryForm = {
  cliente: string;
  destino: string;
  referencia: string;
  observaciones: string;
  fecha: string;
  productos: string;
};

const initialDriverForm: DriverForm = {
  nombre: '',
  email: '',
  telefono: '',
  documento: '',
};

const initialDeliveryForm: DeliveryForm = {
  cliente: '',
  destino: '',
  referencia: '',
  observaciones: '',
  fecha: '',
  productos: '',
};

const emptyWorkspace: AppWorkspace = {
  profile: {
    id: '',
    empresa_id: null,
    nombre: '',
    email: '',
    rol: 'administrador',
    telefono: null,
    activo: true,
  },
  company: null,
  drivers: [],
  orders: [],
  admins: [],
};

export function HomeScreen({ navigation }: HomeScreenProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const [activeTab, setActiveTab] = useState<HomeTabKey>('home');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [workspace, setWorkspace] = useState<AppWorkspace>(emptyWorkspace);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingDriver, setSavingDriver] = useState(false);
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [driverFilter, setDriverFilter] = useState<DriverFilter>('activos');
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryFilter>('todos');
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [driverForm, setDriverForm] = useState<DriverForm>(initialDriverForm);
  const [deliveryForm, setDeliveryForm] = useState<DeliveryForm>(initialDeliveryForm);

  const tabs = useMemo(() => getTabs(workspace.profile.rol), [workspace.profile.rol]);

  const loadWorkspace = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const data = await getAppWorkspace();
      setWorkspace(data);
      const validTabs = getTabs(data.profile.rol).map((tab) => tab.key);
      if (!validTabs.includes(activeTab)) {
        setActiveTab('home');
      }
    } catch (loadError) {
      const message = getErrorMessage(loadError, 'No se pudo cargar la información.');
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation?.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    } catch (signOutError) {
      const message = getErrorMessage(signOutError, 'No se pudo cerrar sesión.');
      Alert.alert('Error', message);
    }
  };

  const updateDriverField = (field: keyof DriverForm, value: string) => {
    setDriverForm((current) => ({ ...current, [field]: value }));
  };

  const updateDeliveryField = (field: keyof DeliveryForm, value: string) => {
    setDeliveryForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreateDriver = async () => {
    if (!driverForm.nombre.trim()) {
      setError('Ingresá el nombre del chofer.');
      return;
    }

    setSavingDriver(true);
    setError('');

    try {
      await createDriver(driverForm);
      setDriverForm(initialDriverForm);
      setShowDriverForm(false);
      await loadWorkspace();
      setActiveTab('drivers');
    } catch (createError) {
      const message = getErrorMessage(createError, 'No se pudo crear el chofer.');
      setError(message);
    } finally {
      setSavingDriver(false);
    }
  };

  const handleCreateDelivery = async () => {
    if (!deliveryForm.cliente.trim()) {
      setError('Ingresá el cliente.');
      return;
    }

    if (!deliveryForm.destino.trim()) {
      setError('Ingresá el destino.');
      return;
    }

    setSavingDelivery(true);
    setError('');

    try {
      await createDelivery(deliveryForm);
      setDeliveryForm(initialDeliveryForm);
      setShowDeliveryForm(false);
      await loadWorkspace();
      setActiveTab('deliveries');
    } catch (createError) {
      const message = getErrorMessage(createError, 'No se pudo crear la entrega.');
      setError(message);
    } finally {
      setSavingDelivery(false);
    }
  };

  const handleAssignDriver = async (orderId: string, driverId: string | null) => {
    setAssigningOrderId(orderId);
    setError('');

    try {
      await assignOrderDriver(orderId, driverId);
      await loadWorkspace();
    } catch (assignError) {
      const message = getErrorMessage(assignError, 'No se pudo asignar el pedido.');
      setError(message);
    } finally {
      setAssigningOrderId(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, estado: string) => {
    setUpdatingOrderId(orderId);
    setError('');

    try {
      await updateOrderStatus(orderId, estado);
      await loadWorkspace();
    } catch (statusError) {
      const message = getErrorMessage(statusError, 'No se pudo actualizar el estado.');
      setError(message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const subtitle = useMemo(() => {
    if (workspace.profile.rol === 'asesor') {
      return 'Panel de asesores.';
    }

    if (workspace.profile.rol === 'chofer') {
      return 'Tus pedidos asignados.';
    }

    return workspace.company?.nombre ?? 'Gestioná tu empresa, choferes y pedidos.';
  }, [workspace.company?.nombre, workspace.profile.rol]);

  return (
    <HomeTemplate
      title={getTitle(activeTab, workspace.profile.rol)}
      subtitle={subtitle}
      tabs={tabs}
      activeTab={activeTab}
      drawerVisible={drawerVisible}
      onTabChange={setActiveTab}
      onOpenDrawer={() => setDrawerVisible(true)}
      onCloseDrawer={() => setDrawerVisible(false)}
      onSignOut={handleSignOut}
      onBellPress={() => undefined}
    >
      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator />
          <Text variant="bodyMedium" style={styles.mutedText}>Cargando datos...</Text>
        </View>
      ) : (
        <View style={styles.screenBody}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => void loadWorkspace(true)} />
            }
          >
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {activeTab === 'home' ? <HomePanel workspace={workspace} /> : null}
            {activeTab === 'admins' ? <AdminsPanel admins={workspace.admins} /> : null}
            {activeTab === 'drivers' ? (
              <DriversPanel
                form={driverForm}
                drivers={workspace.drivers}
                saving={savingDriver}
                showForm={showDriverForm}
                filter={driverFilter}
                canCreate={workspace.profile.rol === 'administrador'}
                onFilterChange={setDriverFilter}
                onChange={updateDriverField}
                onSubmit={handleCreateDriver}
                onCancel={() => setShowDriverForm(false)}
              />
            ) : null}
            {activeTab === 'deliveries' ? (
              <DeliveriesPanel
                role={workspace.profile.rol}
                form={deliveryForm}
                orders={workspace.orders}
                drivers={workspace.drivers}
                assigningOrderId={assigningOrderId}
                updatingOrderId={updatingOrderId}
                filter={deliveryFilter}
                saving={savingDelivery}
                showForm={showDeliveryForm}
                onFilterChange={setDeliveryFilter}
                onChange={updateDeliveryField}
                onSubmit={handleCreateDelivery}
                onCancel={() => setShowDeliveryForm(false)}
                onAssign={handleAssignDriver}
                onUpdateStatus={handleUpdateOrderStatus}
              />
            ) : null}
            {activeTab === 'map' ? <MapPanel /> : null}
          </ScrollView>

          {workspace.profile.rol === 'administrador' && activeTab === 'drivers' ? (
            <FAB
              icon={showDriverForm ? 'close' : 'plus'}
              style={styles.fab}
              onPress={() => setShowDriverForm((visible) => !visible)}
            />
          ) : null}
          {workspace.profile.rol === 'administrador' && activeTab === 'deliveries' ? (
            <FAB
              icon={showDeliveryForm ? 'close' : 'plus'}
              style={styles.fab}
              onPress={() => setShowDeliveryForm((visible) => !visible)}
            />
          ) : null}
        </View>
      )}
    </HomeTemplate>
  );
}

function HomePanel({ workspace }: { workspace: AppWorkspace }) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const assignedOrders = workspace.orders.filter((order) => order.chofer_id).length;

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

  return (
    <View style={styles.panel}>
      <Surface style={styles.summaryCard} elevation={1}>
        <Text variant="titleMedium" style={styles.cardTitle}>Empresa</Text>
        <Text variant="headlineSmall" style={styles.primaryText}>
          {workspace.company?.nombre ?? 'Sin empresa asociada'}
        </Text>
        <Text variant="bodyMedium" style={styles.mutedText}>
          {workspace.company?.email ?? 'Ejecutá la migración de empresas para vincular tu cuenta.'}
        </Text>
      </Surface>

      <View style={styles.metricsRow}>
        <Metric label="Choferes" value={workspace.drivers.length} />
        <Metric label="Pedidos" value={workspace.orders.length} />
        <Metric label="Asignados" value={assignedOrders} />
      </View>
    </View>
  );
}

function AdminsPanel({ admins }: { admins: UserProfile[] }) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  if (admins.length === 0) {
    return <EmptyState text="Todavía no hay administradores de empresa usando la app." />;
  }

  return (
    <View style={styles.panel}>
      {admins.map((admin) => (
        <Surface key={admin.id} style={styles.listRow} elevation={1}>
          <View style={styles.avatar}>
            <Text variant="labelLarge" style={styles.avatarText}>{admin.nombre.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.flexContent}>
            <Text variant="titleSmall" style={styles.primaryText}>{admin.nombre}</Text>
            <Text variant="bodySmall" style={styles.mutedText}>{admin.email}</Text>
          </View>
        </Surface>
      ))}
    </View>
  );
}

function DriversPanel({
  form,
  drivers,
  saving,
  showForm,
  filter,
  canCreate,
  onFilterChange,
  onChange,
  onSubmit,
  onCancel,
}: {
  form: DriverForm;
  drivers: Driver[];
  saving: boolean;
  showForm: boolean;
  filter: DriverFilter;
  canCreate: boolean;
  onFilterChange: (filter: DriverFilter) => void;
  onChange: (field: keyof DriverForm, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const filteredDrivers = drivers.filter((driver) => {
    if (filter === 'activos') return driver.activo;
    if (filter === 'inactivos') return !driver.activo;
    return true;
  });

  return (
    <View style={styles.panel}>
      <View style={styles.filterRow}>
        <FilterChip label="Activos" active={filter === 'activos'} onPress={() => onFilterChange('activos')} />
        <FilterChip label="Inactivos" active={filter === 'inactivos'} onPress={() => onFilterChange('inactivos')} />
        <FilterChip label="Todos" active={filter === 'todos'} onPress={() => onFilterChange('todos')} />
      </View>

      {canCreate && showForm ? (
        <Surface style={styles.formCard} elevation={1}>
          <View style={styles.orderHeader}>
            <Text variant="titleMedium" style={[styles.cardTitle, styles.flexContent]}>Nuevo Chofer</Text>
            <IconButton icon="close" size={20} onPress={onCancel} disabled={saving} />
          </View>
          <TextInputField
            label="Nombre y Apellido"
            placeholder="Ej: Juan Perez"
            value={form.nombre}
            onChangeText={(value) => onChange('nombre', value)}
            disabled={saving}
            icon="account-outline"
          />
          <TextInputField
            label="DNI"
            placeholder="Ej: 12345678"
            value={form.documento}
            onChangeText={(value) => onChange('documento', value.replace(/\D/g, ''))}
            keyboardType="number-pad"
            disabled={saving}
            icon="card-account-details-outline"
          />
          <TextInputField
            label="Email"
            placeholder="Ej: juan@email.com"
            value={form.email}
            onChangeText={(value) => onChange('email', value.trim())}
            keyboardType="email-address"
            autoCapitalize="none"
            disabled={saving}
            icon="email-outline"
          />
          <TextInputField
            label="Teléfono"
            placeholder="Ej: 5491112345678"
            value={form.telefono}
            onChangeText={(value) => onChange('telefono', value.replace(/\D/g, ''))}
            keyboardType="phone-pad"
            disabled={saving}
            icon="phone-outline"
          />
          <Text variant="bodySmall" style={styles.mutedText}>
            El chofer podrá ingresar con su email y contraseña inicial 123456.
          </Text>
          <View style={styles.formActions}>
            <CTAButton variant="secondary" onPress={onCancel} disabled={saving} style={styles.actionButton}>
              Cancelar
            </CTAButton>
            <CTAButton onPress={onSubmit} loading={saving} disabled={saving} style={styles.actionButton}>
              {saving ? 'Guardando...' : 'Guardar'}
            </CTAButton>
          </View>
        </Surface>
      ) : null}

      {filteredDrivers.length === 0 ? (
        <EmptyState text="No hay choferes para este filtro." />
      ) : (
        filteredDrivers.map((driver) => <DriverRow key={driver.id} driver={driver} />)
      )}
    </View>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <CTAButton
      compact
      variant={active ? 'primary' : 'secondary'}
      onPress={onPress}
      style={styles.filterChip}
      labelStyle={styles.filterChipLabel}
    >
      {label}
    </CTAButton>
  );
}

function DeliveriesPanel({
  role,
  form,
  orders,
  drivers,
  assigningOrderId,
  updatingOrderId,
  filter,
  saving,
  showForm,
  onFilterChange,
  onChange,
  onSubmit,
  onCancel,
  onAssign,
  onUpdateStatus,
}: {
  role: AppWorkspace['profile']['rol'];
  form: DeliveryForm;
  orders: DeliveryOrder[];
  drivers: Driver[];
  assigningOrderId: string | null;
  updatingOrderId: string | null;
  filter: DeliveryFilter;
  saving: boolean;
  showForm: boolean;
  onFilterChange: (filter: DeliveryFilter) => void;
  onChange: (field: keyof DeliveryForm, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onAssign: (orderId: string, driverId: string | null) => void;
  onUpdateStatus: (orderId: string, estado: string) => void;
}) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const statusOptions: DeliveryFilter[] = ['pendiente', 'en camino', 'realizado'];
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const selectedDate = parseDeliveryFormDate(form.fecha);

  const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setDatePickerVisible(false);
    }

    if (date) {
      onChange('fecha', formatDateForInput(date));
    }
  };
  const filteredOrders = orders.filter((order) => {
    if (filter === 'todos') return true;
    return normalizeOrderStatus(order.estado) === filter;
  });

  if (orders.length === 0 && role === 'chofer') {
    return <EmptyState text="No tenes pedidos asignados." />;
  }

  return (
    <View style={styles.panel}>
      <View style={styles.filterRow}>
        <FilterChip label="Todos" active={filter === 'todos'} onPress={() => onFilterChange('todos')} />
        <FilterChip label="Pendientes" active={filter === 'pendiente'} onPress={() => onFilterChange('pendiente')} />
        <FilterChip label="En camino" active={filter === 'en camino'} onPress={() => onFilterChange('en camino')} />
        <FilterChip label="Realizados" active={filter === 'realizado'} onPress={() => onFilterChange('realizado')} />
      </View>

      {role === 'administrador' && showForm ? (
        <Surface style={styles.formCard} elevation={1}>
          <View style={styles.orderHeader}>
            <Text variant="titleMedium" style={[styles.cardTitle, styles.flexContent]}>Nueva entrega</Text>
            <IconButton icon="close" size={20} onPress={onCancel} disabled={saving} />
          </View>
          <TextInputField
            label="Cliente"
            placeholder="Buscar cliente"
            value={form.cliente}
            onChangeText={(value) => onChange('cliente', value)}
            disabled={saving}
            icon="account-search-outline"
          />
          <TextInputField
            label="Destino"
            placeholder="Direccion de entrega"
            value={form.destino}
            onChangeText={(value) => onChange('destino', value)}
            disabled={saving}
            icon="map-marker-outline"
          />
          <TextInputField
            label="Referencia"
            placeholder="Ej: Pedido del cliente"
            value={form.referencia}
            onChangeText={(value) => onChange('referencia', value)}
            disabled={saving}
            icon="barcode-scan"
          />
          <TextInputField
            label="Fecha"
            placeholder="Seleccionar fecha"
            value={formatDateForDisplay(form.fecha)}
            onPressIn={() => {
              if (!saving) setDatePickerVisible(true);
            }}
            editable={false}
            showSoftInputOnFocus={false}
            disabled={saving}
            icon="calendar-outline"
            right={
              <PaperTextInput.Icon
                icon="calendar-month-outline"
                onPress={() => setDatePickerVisible(true)}
                disabled={saving}
              />
            }
          />
          {datePickerVisible ? (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          ) : null}
          {Platform.OS === 'ios' && datePickerVisible ? (
            <CTAButton compact variant="secondary" onPress={() => setDatePickerVisible(false)} style={styles.datePickerDoneButton}>
              Listo
            </CTAButton>
          ) : null}
          <TextInputField
            label="Productos"
            placeholder="Detalle de productos"
            value={form.productos}
            onChangeText={(value) => onChange('productos', value)}
            disabled={saving}
            icon="package-variant-closed"
          />
          <TextInputField
            label="Observaciones"
            placeholder="Observaciones adicionales"
            value={form.observaciones}
            onChangeText={(value) => onChange('observaciones', value)}
            disabled={saving}
            icon="text-box-outline"
            multiline
            numberOfLines={3}
          />
          <View style={styles.formActions}>
            <CTAButton variant="secondary" onPress={onCancel} disabled={saving} style={styles.actionButton}>
              Cancelar
            </CTAButton>
            <CTAButton onPress={onSubmit} loading={saving} disabled={saving} style={styles.actionButton}>
              {saving ? 'Guardando...' : 'Guardar'}
            </CTAButton>
          </View>
        </Surface>
      ) : null}

      {filteredOrders.length === 0 ? (
        <EmptyState text={orders.length === 0 ? 'No hay pedidos asociados a esta empresa.' : 'No hay entregas para este filtro.'} />
      ) : null}

      {filteredOrders.map((order) => {
        const assignedDriver = drivers.find((driver) => driver.usuario_id === order.chofer_id || driver.id === order.chofer_id);
        const currentStatus = normalizeOrderStatus(order.estado);
        const isAssigning = assigningOrderId === order.id;
        const isUpdating = updatingOrderId === order.id;
        const canEditStatus = role === 'administrador' || role === 'chofer';

        return (
          <Surface key={order.id} style={styles.orderCard} elevation={1}>
            <View style={styles.orderHeader}>
              <View style={styles.flexContent}>
                <Text variant="titleMedium" style={styles.cardTitle}>{getOrderTitle(order)}</Text>
                <Text variant="bodySmall" style={styles.mutedText}>{getOrderDestination(order)}</Text>
              </View>
              <View style={[styles.orderStatusBadge, getOrderStatusStyle(currentStatus, styles)]}>
                <Text variant="labelSmall" style={styles.orderStatusText}>{getOrderStatusLabel(currentStatus)}</Text>
              </View>
              {isAssigning || isUpdating ? <ActivityIndicator size="small" /> : null}
            </View>

            <View style={styles.orderMetaGrid}>
              <OrderMeta label="Cliente" value={getOrderField(order, ['cliente', 'cliente_nombre', 'nombre_cliente'])} />
              <OrderMeta label="Referencia" value={getOrderField(order, ['referencia', 'codigo_cliente', 'numero', 'codigo'])} />
              <OrderMeta label="Fecha" value={formatOrderDate(order)} />
              <OrderMeta label="Chofer" value={assignedDriver?.nombre ?? 'Sin asignar'} />
            </View>

            {getOrderProducts(order) ? (
              <Text variant="bodySmall" style={styles.mutedText}>{getOrderProducts(order)}</Text>
            ) : null}

            <Divider style={styles.divider} />

            {role === 'administrador' ? (
              <View style={styles.sectionBlock}>
                <Text variant="labelLarge" style={styles.inputLabel}>Asignar chofer</Text>
                <View style={styles.driverActions}>
                  {drivers.length === 0 ? (
                    <Text variant="bodySmall" style={styles.mutedText}>Primero crea un chofer.</Text>
                  ) : null}
                  {drivers.map((driver) => (
                    <CTAButton
                      key={driver.id}
                      variant={driver.usuario_id === order.chofer_id || driver.id === order.chofer_id ? 'primary' : 'secondary'}
                      compact
                      disabled={isAssigning}
                      style={styles.smallButton}
                      labelStyle={styles.smallButtonLabel}
                      onPress={() => onAssign(order.id, driver.id)}
                    >
                      {driver.nombre}
                    </CTAButton>
                  ))}
                  {order.chofer_id ? (
                    <IconButton
                      icon="account-remove-outline"
                      mode="outlined"
                      disabled={isAssigning}
                      onPress={() => onAssign(order.id, null)}
                    />
                  ) : null}
                </View>
              </View>
            ) : null}

            {canEditStatus ? (
              <View style={styles.sectionBlock}>
                <Text variant="labelLarge" style={styles.inputLabel}>Estado</Text>
                <View style={styles.driverActions}>
                  {statusOptions.map((status) => (
                    <CTAButton
                      key={status}
                      variant={currentStatus === status ? 'primary' : 'secondary'}
                      compact
                      disabled={isUpdating}
                      style={styles.smallButton}
                      labelStyle={styles.smallButtonLabel}
                      onPress={() => onUpdateStatus(order.id, status)}
                    >
                      {getOrderStatusLabel(status)}
                    </CTAButton>
                  ))}
                </View>
              </View>
            ) : null}
          </Surface>
        );
      })}
    </View>
  );
}

function OrderMeta({ label, value }: { label: string; value: string | null }) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <View style={styles.orderMetaItem}>
      <Text variant="labelSmall" style={styles.inputLabel}>{label}</Text>
      <Text variant="bodySmall" style={styles.primaryText} numberOfLines={2}>{value ?? '-'}</Text>
    </View>
  );
}

function MapPanel() {
  return <EmptyState text="El mapa va a usar los pedidos asignados a choferes." />;
}

function DriverRow({ driver }: { driver: Driver }) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const vehicle = driver.vehiculo ?? driver.vehicle ?? driver.patente ?? 'Sin vehiculo';
  const zone = driver.zona ?? driver.zone ?? 'Sin zona';

  return (
    <Surface style={styles.driverCard} elevation={1}>
      <View style={styles.driverAvatar}>
        <Text variant="labelLarge" style={styles.driverAvatarText}>{driver.nombre.slice(0, 1).toUpperCase()}</Text>
      </View>
      <View style={styles.flexContent}>
        <Text variant="titleSmall" style={styles.primaryText}>{driver.nombre}</Text>
        <Text variant="bodySmall" style={styles.mutedText}>Vehiculo: {String(vehicle)}</Text>
        <Text variant="bodySmall" style={styles.mutedText}>Zona: {String(zone)}</Text>
      </View>
      <View style={styles.driverTrailing}>
        <View style={[styles.statusBadge, driver.activo ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
          <Text variant="labelSmall" style={driver.activo ? styles.statusBadgeTextActive : styles.statusBadgeTextInactive}>
            {driver.activo ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
        <IconButton icon="chevron-right" size={20} onPress={() => undefined} />
      </View>
    </Surface>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <Surface style={styles.metricCard} elevation={1}>
      <Text variant="headlineSmall" style={styles.primaryText}>{value}</Text>
      <Text variant="labelMedium" style={styles.mutedText}>{label}</Text>
    </Surface>
  );
}

function EmptyState({ text }: { text: string }) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <Surface style={styles.emptyState} elevation={1}>
      <Text variant="bodyMedium" style={styles.mutedText}>{text}</Text>
    </Surface>
  );
}

function getOrderTitle(order: DeliveryOrder) {
  const possibleTitle = order.codigo ?? order.numero ?? order.nombre ?? order.id;
  return `Pedido ${String(possibleTitle).slice(0, 12)}`;
}

function getOrderField(order: DeliveryOrder, fields: string[]) {
  for (const field of fields) {
    const value = order[field];
    if (value !== null && value !== undefined && String(value).trim()) {
      return String(value);
    }
  }

  return null;
}

function getOrderDestination(order: DeliveryOrder) {
  return getOrderField(order, ['destino', 'direccion', 'direccion_entrega', 'domicilio']) ?? 'Destino sin cargar';
}

function getOrderProducts(order: DeliveryOrder) {
  const productos = order.productos ?? order.items ?? order.detalle;

  if (Array.isArray(productos)) {
    return `${productos.length} producto${productos.length === 1 ? '' : 's'}`;
  }

  if (typeof productos === 'string' && productos.trim()) {
    return productos;
  }

  return null;
}

function parseDeliveryFormDate(value: string) {
  if (!value) return new Date();

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDateForDisplay(value: string) {
  if (!value) return '';

  const date = parseDeliveryFormDate(value);
  return date.toLocaleDateString();
}

function formatOrderDate(order: DeliveryOrder) {
  const value = getOrderField(order, ['fecha_programada', 'fecha', 'fecha_entrega', 'created_at']);
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString();
}

function normalizeOrderStatus(status: unknown): DeliveryFilter {
  const normalized = String(status ?? 'pendiente').toLowerCase().trim();

  if (normalized === 'realizado' || normalized === 'entregado' || normalized === 'finalizado') return 'realizado';
  if (normalized === 'en camino' || normalized === 'en_camino' || normalized === 'encamino') return 'en camino';

  return 'pendiente';
}

function getOrderStatusLabel(status: DeliveryFilter) {
  if (status === 'en camino') return 'En camino';
  if (status === 'realizado') return 'Realizado';
  return 'Pendiente';
}

function getOrderStatusStyle(status: DeliveryFilter, styles: ReturnType<typeof createStyles>) {
  if (status === 'realizado') return styles.orderStatusDone;
  if (status === 'en camino') return styles.orderStatusOnWay;
  return styles.orderStatusPending;
}

function getTabs(role: AppWorkspace['profile']['rol']): Array<BottomTabMenuItem<HomeTabKey>> {
  if (role === 'asesor') {
    return [
      { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
      { key: 'admins', label: 'Admins', icon: 'account-tie-outline', activeIcon: 'account-tie' },
    ];
  }

  if (role === 'chofer') {
    return [
      { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
      { key: 'deliveries', label: 'Pedidos', icon: 'truck-outline', activeIcon: 'truck' },
      { key: 'map', label: 'Mapa', icon: 'map-outline', activeIcon: 'map' },
    ];
  }

  return [
    { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { key: 'deliveries', label: 'Entregas', icon: 'truck-outline', activeIcon: 'truck' },
    { key: 'drivers', label: 'Choferes', icon: 'account-group-outline', activeIcon: 'account-group' },
    { key: 'map', label: 'Mapa', icon: 'map-outline', activeIcon: 'map' },
  ];
}

function getTitle(activeTab: HomeTabKey, role: AppWorkspace['profile']['rol']) {
  const labels: Record<HomeTabKey, string> = {
    home: role === 'asesor' ? 'Asesor' : role === 'chofer' ? 'Chofer' : 'Empresa',
    deliveries: role === 'chofer' ? 'Mis pedidos' : 'Entregas',
    drivers: 'Choferes',
    admins: 'Administradores',
    map: 'Mapa',
  };

  return labels[activeTab];
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
    panel: {
      gap: 14,
    },
    summaryCard: {
      padding: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
      gap: 4,
    },
    formCard: {
      padding: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    filterRow: {
      flexDirection: 'row',
      gap: 8,
    },
    filterChip: {
      borderRadius: 8,
    },
    filterChipLabel: {
      fontSize: 12,
    },
    formActions: {
      flexDirection: 'row',
      gap: 10,
    },
    datePickerDoneButton: {
      alignSelf: 'flex-end',
      borderRadius: 8,
      marginBottom: 8,
    },
    actionButton: {
      flex: 1,
    },
    orderCard: {
      padding: 14,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
      gap: 10,
    },
    orderMetaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    orderMetaItem: {
      width: '47%',
      minWidth: 130,
      gap: 2,
    },
    orderStatusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
    },
    orderStatusPending: {
      backgroundColor: '#FEF3C7',
    },
    orderStatusOnWay: {
      backgroundColor: '#DBEAFE',
    },
    orderStatusDone: {
      backgroundColor: '#DCFCE7',
    },
    orderStatusText: {
      color: theme.colors.onSurface,
      fontWeight: '800',
    },
    sectionBlock: {
      gap: 8,
    },
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    driverCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    driverAvatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceVariant,
    },
    driverAvatarText: {
      color: theme.colors.onSurfaceVariant,
      fontWeight: '800',
    },
    driverTrailing: {
      alignItems: 'flex-end',
      gap: 2,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
    },
    statusBadgeActive: {
      backgroundColor: '#DCFCE7',
    },
    statusBadgeInactive: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    statusBadgeTextActive: {
      color: '#15803D',
      fontWeight: '700',
    },
    statusBadgeTextInactive: {
      color: theme.colors.onSurfaceVariant,
      fontWeight: '700',
    },
    metricsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    metricCard: {
      flex: 1,
      padding: 14,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    emptyState: {
      padding: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    orderHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    flexContent: {
      flex: 1,
    },
    driverActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    avatarText: {
      color: theme.colors.onPrimary,
      fontWeight: '800',
    },
    sectionTitle: {
      marginTop: 4,
      color: theme.colors.onSurface,
      fontWeight: '700',
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
    errorText: {
      color: theme.colors.error,
      fontWeight: '600',
    },
    inputLabel: {
      color: theme.colors.onSurfaceVariant,
    },
    divider: {
      backgroundColor: theme.colors.outline,
    },
    smallButton: {
      borderRadius: 8,
    },
    smallButtonLabel: {
      fontSize: 12,
    },
    fab: {
      position: 'absolute',
      right: 18,
      bottom: 18,
      backgroundColor: theme.colors.primary,
    },
  });
