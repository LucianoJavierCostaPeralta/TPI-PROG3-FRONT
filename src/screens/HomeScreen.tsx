import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
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
import { CTAButton, TextInputField, UserAvatar } from '../components/atoms';
import { spacing, radii, dimensions } from '../styles/theme';
import {
  acceptDelivery,
  assignDriver,
  createDelivery,
  createDriver,
  getApiErrorMessage,
  getProfile,
  listAdminDeliveries,
  listDriverDeliveries,
  listDrivers,
  logout,
  updateDeliveryState,
  type AuthUser,
  type Delivery,
  type Driver as ApiDriver,
} from '../services/api';
import {
  DNI_PATTERN,
  EMAIL_PATTERN,
  PHONE_PATTERN,
  isPastDate,
  onlyDigits,
} from '../utils/validation';

type UserRole = 'administrador' | 'asesor' | 'chofer';

type Company = {
  id: string;
  nombre: string;
  cuit: string | null;
  email: string | null;
  telefono: string | null;
};

type UserProfile = {
  id: string;
  empresa_id: string | null;
  nombre: string;
  email: string;
  rol: UserRole;
  telefono: string | null;
  activo: boolean;
  created_at?: string;
};

type Driver = {
  id: string;
  empresa_id: string;
  usuario_id: string | null;
  nombre: string;
  email: string | null;
  telefono: string | null;
  documento: string | null;
  vehiculo?: unknown;
  vehicle?: unknown;
  patente?: unknown;
  zona?: unknown;
  zone?: unknown;
  activo: boolean;
  created_at: string;
};

type DeliveryOrder = {
  id: string;
  empresa_id?: string | null;
  chofer_id?: string | null;
  estado?: string | null;
  estado_id?: number;
  created_at?: string | null;
  [key: string]: unknown;
};

type AppWorkspace = {
  profile: UserProfile;
  company: Company | null;
  drivers: Driver[];
  orders: DeliveryOrder[];
  admins: UserProfile[];
};

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
  fechaNacimiento: string;
};

type DeliveryForm = {
  cliente: string;
  clienteDni: string;
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
  fechaNacimiento: '',
};

const initialDeliveryForm: DeliveryForm = {
  cliente: '',
  clienteDni: '',
  destino: '',
  referencia: '',
  observaciones: '',
  fecha: '',
  productos: '',
};

const emptyWorkspace: AppWorkspace = {
  profile: {
    id: 'local-admin-user',
    empresa_id: 'local-company',
    nombre: 'Administrador local',
    email: 'admin@empresa.local',
    rol: 'administrador',
    telefono: null,
    activo: true,
  },
  company: {
    id: 'local-company',
    nombre: 'Empresa local',
    cuit: null,
    email: 'admin@empresa.local',
    telefono: null,
  },
  drivers: [],
  orders: [],
  admins: [],
};

function normalizeRole(role?: string): UserRole {
  const normalized = role?.toLowerCase();
  if (normalized === 'chofer' || normalized === 'asesor') return normalized;
  return 'administrador';
}

function mapDriver(driver: ApiDriver): Driver {
  return {
    id: driver.id,
    empresa_id: driver.empresa_id,
    usuario_id: driver.id,
    nombre: driver.nombre_completo,
    email: driver.email,
    telefono: driver.telefono,
    documento: driver.dni,
    activo: driver.activo,
    created_at: driver.created_at,
  };
}

function mapDelivery(delivery: Delivery): DeliveryOrder {
  return {
    ...delivery,
    estado: delivery.estado?.nombre_estado ?? String(delivery.estado_id),
    destino: delivery.direccion_destino,
    productos: delivery.producto,
  };
}

async function loadRoleData(_user: AuthUser, role: UserRole) {
  if (role === 'chofer') {
    return { drivers: [], orders: (await listDriverDeliveries()).map(mapDelivery) };
  }
  if (role === 'administrador') {
    const [drivers, orders] = await Promise.all([listDrivers(), listAdminDeliveries()]);
    return { drivers: drivers.map(mapDriver), orders: orders.map(mapDelivery) };
  }
  return { drivers: [], orders: [] };
}

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
      const user = await getProfile();
      const role = normalizeRole(user.rol?.nombre_rol);
      const roleData = await loadRoleData(user, role);
      setWorkspace({
        ...emptyWorkspace,
        ...roleData,
        profile: {
          id: String(user.id),
          empresa_id: user.empresa_id ? String(user.empresa_id) : null,
          nombre: user.nombre_completo,
          email: user.email,
          rol: role,
          telefono: user.telefono,
          activo: user.activo,
        },
        company: user.empresa ? {
          id: String(user.empresa.id),
          nombre: user.empresa.razon_social,
          cuit: null,
          email: null,
          telefono: null,
        } : null,
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo cargar el perfil.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadWorkspace();
    }, [loadWorkspace])
  );

  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      navigation?.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
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

    if (!/^[\p{L}\s]+$/u.test(driverForm.nombre.trim()) || driverForm.nombre.trim().length < 3) {
      setError('El nombre debe tener al menos 3 letras y no puede contener números.');
      return;
    }
    if (!DNI_PATTERN.test(driverForm.documento)) {
      setError('El DNI debe tener exactamente 8 números.');
      return;
    }
    if (!isPastDate(driverForm.fechaNacimiento)) {
      setError('Seleccioná una fecha de nacimiento anterior a hoy.');
      return;
    }
    if (!EMAIL_PATTERN.test(driverForm.email.trim())) {
      setError('Ingresá un correo válido, por ejemplo example@example.com.');
      return;
    }
    if (driverForm.telefono && !PHONE_PATTERN.test(driverForm.telefono)) {
      setError('El teléfono debe contener entre 8 y 15 números.');
      return;
    }

    setSavingDriver(true);
    setError('');
    try {
      await createDriver({
        nombre_completo: driverForm.nombre.trim(),
        dni: driverForm.documento,
        fecha_nacimiento: driverForm.fechaNacimiento,
        email: driverForm.email.trim().toLowerCase(),
        telefono: driverForm.telefono || undefined,
        password: '123456',
      });
      setDriverForm(initialDriverForm);
      setShowDriverForm(false);
      await loadWorkspace(true);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo crear el chofer.'));
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
    if (deliveryForm.cliente.trim().length < 2) {
      setError('El nombre del cliente debe tener al menos 2 caracteres.');
      return;
    }
    if (!DNI_PATTERN.test(deliveryForm.clienteDni)) {
      setError('El DNI del cliente debe tener exactamente 8 números.');
      return;
    }
    if (deliveryForm.destino.trim().length < 3) {
      setError('El destino debe tener al menos 3 caracteres.');
      return;
    }
    if (deliveryForm.productos.trim().length < 2) {
      setError('El producto debe tener al menos 2 caracteres.');
      return;
    }

    setSavingDelivery(true);
    setError('');

    try {
      await createDelivery({
        cliente: deliveryForm.cliente.trim(),
        cliente_dni: deliveryForm.clienteDni,
        producto: deliveryForm.productos.trim(),
        direccion_destino: deliveryForm.destino.trim(),
        referencia: deliveryForm.referencia.trim() || deliveryForm.observaciones.trim() || undefined,
      });
      setDeliveryForm(initialDeliveryForm);
      setShowDeliveryForm(false);
      await loadWorkspace(true);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo crear la entrega.'));
    } finally {
      setSavingDelivery(false);
    }
  };

  const handleAssignDriver = async (orderId: string, driverId: string | null) => {
    setAssigningOrderId(orderId);
    setError('');

    try {
      await assignDriver(orderId, driverId);
      await loadWorkspace(true);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo asignar el chofer.'));
    } finally {
      setAssigningOrderId(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, action: string, clienteDni?: string) => {
    setUpdatingOrderId(orderId);
    setError('');

    try {
      if (action === 'accept') await acceptDelivery(orderId);
      if (action === 'on_the_way') await updateDeliveryState(orderId, 4);
      if (action === 'delivered') await updateDeliveryState(orderId, 5, clienteDni);
      await loadWorkspace(true);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo actualizar el estado.'));
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
          <UserAvatar name={admin.nombre} style={styles.adminAvatar} />
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
  const [birthDatePickerVisible, setBirthDatePickerVisible] = useState(false);
  const selectedBirthDate = form.fechaNacimiento
    ? parseDeliveryFormDate(form.fechaNacimiento)
    : new Date(1990, 0, 1);
  const handleBirthDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setBirthDatePickerVisible(false);
    }
    if (date) {
      onChange('fechaNacimiento', formatDateForInput(date));
    }
  };
  const filteredDrivers = drivers.filter((driver) => {
    if (filter === 'activos') return driver.activo;
    if (filter === 'inactivos') return !driver.activo;
    return true;
  });

  return (
    <View style={styles.panel}>
      {!showForm && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <FilterChip label="Activos" active={filter === 'activos'} onPress={() => onFilterChange('activos')} />
          <FilterChip label="Inactivos" active={filter === 'inactivos'} onPress={() => onFilterChange('inactivos')} />
          <FilterChip label="Todos" active={filter === 'todos'} onPress={() => onFilterChange('todos')} />
        </ScrollView>
      )}

      {canCreate && showForm ? (
        <Surface style={styles.formCard} elevation={1}>
          <View style={styles.orderHeader}>
            <Text variant="titleMedium" style={[styles.cardTitle, styles.flexContent]}>Nuevo Chofer</Text>
            <IconButton icon="close" size={20} onPress={onCancel} disabled={saving} />
          </View>
          <View style={styles.formContent}>
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
            onChangeText={(value) => onChange('documento', onlyDigits(value, 8))}
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
            label="Fecha de nacimiento"
            placeholder="Seleccionar fecha"
            value={formatDateForDisplay(form.fechaNacimiento)}
            onPressIn={() => {
              if (!saving) setBirthDatePickerVisible(true);
            }}
            editable={false}
            showSoftInputOnFocus={false}
            disabled={saving}
            icon="calendar-outline"
            right={
              <PaperTextInput.Icon
                icon="calendar-month-outline"
                onPress={() => setBirthDatePickerVisible(true)}
                disabled={saving}
              />
            }
          />
          {birthDatePickerVisible ? (
            <DateTimePicker
              value={selectedBirthDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date(Date.now() - 86_400_000)}
              onChange={handleBirthDateChange}
            />
          ) : null}
          {Platform.OS === 'ios' && birthDatePickerVisible ? (
            <CTAButton
              compact
              variant="secondary"
              onPress={() => setBirthDatePickerVisible(false)}
              style={styles.datePickerDoneButton}
            >
              Listo
            </CTAButton>
          ) : null}
          <TextInputField
            label="Teléfono"
            placeholder="Ej: 5491112345678"
            value={form.telefono}
            onChangeText={(value) => onChange('telefono', onlyDigits(value, 15))}
            keyboardType="phone-pad"
            disabled={saving}
            icon="phone-outline"
          />
          <Text variant="bodySmall" style={styles.mutedText}>
            El chofer podrá ingresar con su email y contraseña inicial 123456.
          </Text>
          </View>
          <View style={styles.formActions}>
            <CTAButton variant="secondary" onPress={onCancel} disabled={saving} style={styles.actionButton}>
              Cancelar
            </CTAButton>
            <CTAButton onPress={onSubmit} loading={saving} disabled={saving} style={styles.actionButton}>
              {saving ? 'Guardando...' : 'Guardar'}
            </CTAButton>
          </View>
        </Surface>
      ) : filteredDrivers.length === 0 ? (
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
  onUpdateStatus: (orderId: string, action: string, clienteDni?: string) => void;
}) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [deliveryDnis, setDeliveryDnis] = useState<Record<string, string>>({});
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <FilterChip label="Todos" active={filter === 'todos'} onPress={() => onFilterChange('todos')} />
        <FilterChip label="Pendientes" active={filter === 'pendiente'} onPress={() => onFilterChange('pendiente')} />
        <FilterChip label="En camino" active={filter === 'en camino'} onPress={() => onFilterChange('en camino')} />
        <FilterChip label="Realizados" active={filter === 'realizado'} onPress={() => onFilterChange('realizado')} />
      </ScrollView>

      {role === 'administrador' && showForm ? (
        <Surface style={styles.formCard} elevation={1}>
          <View style={styles.orderHeader}>
            <Text variant="titleMedium" style={[styles.cardTitle, styles.flexContent]}>Nueva entrega</Text>
            <IconButton icon="close" size={20} onPress={onCancel} disabled={saving} />
          </View>
          <View style={styles.formContent}>
          <TextInputField
            label="Cliente"
            placeholder="Buscar cliente"
            value={form.cliente}
            onChangeText={(value) => onChange('cliente', value)}
            disabled={saving}
            icon="account-search-outline"
          />
          <TextInputField
            label="DNI del cliente"
            placeholder="12345678"
            value={form.clienteDni}
            onChangeText={(value) => onChange('clienteDni', onlyDigits(value, 8))}
            keyboardType="number-pad"
            disabled={saving}
            icon="card-account-details-outline"
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
          </View>
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
        const currentStatus = normalizeOrderStatus(order.estado_id ?? order.estado);
        const isAssigning = assigningOrderId === order.id;
        const isUpdating = updatingOrderId === order.id;
        const canEditStatus = role === 'chofer';

        return (
          <Surface key={order.id} style={styles.orderCard} elevation={1}>
            <View style={styles.orderHeader}>
              <View style={styles.flexContent}>
                <Text variant="titleMedium" style={styles.cardTitle}>{getOrderTitle(order)}</Text>
                <Text variant="bodySmall" style={styles.mutedText}>{getOrderDestination(order)}</Text>
              </View>
              <View style={[styles.orderStatusBadge, getOrderStatusStyle(currentStatus, styles)]}>
                <Text variant="labelSmall" style={styles.orderStatusText}>{getBackendStatusLabel(order)}</Text>
              </View>
              {isAssigning || isUpdating ? <ActivityIndicator size="small" /> : null}
            </View>

            <View style={styles.orderMetaGrid}>
              <OrderMeta label="Cliente" value={getOrderField(order, ['cliente', 'cliente_nombre', 'nombre_cliente'])} />
              <OrderMeta label="Referencia" value={getOrderField(order, ['referencia', 'codigo_cliente', 'numero', 'codigo'])} />
              <OrderMeta label="Fecha" value={formatOrderDate(order)} />
              <OrderMeta
                label="Chofer"
                value={assignedDriver?.nombre ?? getAssignedDriverName(order) ?? (role === 'chofer' ? 'Vos' : 'Sin asignar')}
              />
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

            {canEditStatus && order.estado_id === 2 ? (
              <View style={styles.sectionBlock}>
                <Text variant="labelLarge" style={styles.inputLabel}>Estado</Text>
                <CTAButton
                  compact
                  disabled={isUpdating}
                  loading={isUpdating}
                  onPress={() => onUpdateStatus(order.id, 'accept')}
                >
                  Aceptar entrega
                </CTAButton>
              </View>
            ) : null}

            {canEditStatus && order.estado_id === 3 ? (
              <View style={styles.sectionBlock}>
                <Text variant="labelLarge" style={styles.inputLabel}>Entrega aceptada</Text>
                <CTAButton
                  compact
                  disabled={isUpdating}
                  loading={isUpdating}
                  onPress={() => onUpdateStatus(order.id, 'on_the_way')}
                >
                  Iniciar recorrido
                </CTAButton>
              </View>
            ) : null}

            {canEditStatus && order.estado_id === 4 ? (
              <View style={styles.sectionBlock}>
                <TextInputField
                  label="DNI del cliente"
                  placeholder="Ingresalo para confirmar la entrega"
                  value={deliveryDnis[order.id] ?? ''}
                  onChangeText={(value) => setDeliveryDnis((current) => ({
                    ...current,
                    [order.id]: onlyDigits(value, 8),
                  }))}
                  keyboardType="number-pad"
                  disabled={isUpdating}
                  icon="card-account-details-outline"
                />
                <CTAButton
                  compact
                  disabled={isUpdating || (deliveryDnis[order.id]?.length ?? 0) !== 8}
                  loading={isUpdating}
                  onPress={() => onUpdateStatus(order.id, 'delivered', deliveryDnis[order.id])}
                >
                  Confirmar entrega
                </CTAButton>
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
      <UserAvatar name={driver.nombre} style={{ marginRight: spacing.md }} />
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
  return getOrderField(order, ['direccion_destino', 'destino', 'direccion', 'direccion_entrega', 'domicilio']) ?? 'Destino sin cargar';
}

function getOrderProducts(order: DeliveryOrder) {
  const productos = order.producto ?? order.productos ?? order.items ?? order.detalle;

  if (Array.isArray(productos)) {
    return `${productos.length} producto${productos.length === 1 ? '' : 's'}`;
  }

  if (typeof productos === 'string' && productos.trim()) {
    return productos;
  }

  return null;
}

function getAssignedDriverName(order: DeliveryOrder) {
  const chofer = order.chofer;
  if (chofer && typeof chofer === 'object' && 'nombre_completo' in chofer) {
    return String(chofer.nombre_completo);
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

  if (['5', '6', 'realizado', 'entregado', 'entregada', 'delivered', 'finalizado'].includes(normalized)) return 'realizado';
  if (['4', 'en camino', 'en_camino', 'encamino', 'on the way', 'on_the_way'].includes(normalized)) return 'en camino';

  return 'pendiente';
}

function getOrderStatusLabel(status: DeliveryFilter) {
  if (status === 'en camino') return 'En camino';
  if (status === 'realizado') return 'Realizado';
  return 'Pendiente';
}

function getBackendStatusLabel(order: DeliveryOrder) {
  if (order.estado_id === 5 || order.estado_id === 6) {
    return 'Finalizado';
  }
  const status = String(order.estado ?? '').trim();
  if (status && !/^\d+$/.test(status)) {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
  return getOrderStatusLabel(normalizeOrderStatus(status));
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
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface,
      gap: 4,
    },
    formCard: {
      padding: 16,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface,
    },
    filterRow: {
      flexDirection: 'row',
      gap: 8,
      paddingRight: 16,
    },
    filterChip: {
      minWidth: 94,
      borderRadius: radii.md,
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
      borderRadius: radii.md,
      marginBottom: 8,
    },
    actionButton: {
      flex: 1,
    },
    orderCard: {
      padding: 14,
      borderRadius: radii.md,
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
      width: dimensions.avatar.sm,
      height: dimensions.avatar.sm,
      borderRadius: dimensions.avatar.sm / 2,
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
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface,
    },
    emptyState: {
      padding: 16,
      borderRadius: radii.md,
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
      width: dimensions.avatar.xs,
      height: dimensions.avatar.xs,
      borderRadius: dimensions.avatar.xs / 2,
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
      borderRadius: radii.md,
    },
    smallButtonLabel: {
      fontSize: 12,
    },
    adminAvatar: {
      marginRight: spacing.md,
    },
    formContent: {
      gap: spacing.sm,
    },
    fab: {
      position: 'absolute',
      right: 18,
      bottom: 18,
      backgroundColor: theme.colors.primary,
    },
  });
