import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, RefreshControl, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
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
import { HomePanel, DriversPanel, DeliveriesPanel, AdminsPanel, MapPanel } from '../components/organisms';
import { spacing, radii, dimensions } from '../styles/theme';
import {
  acceptDelivery,
  assignDriver,
  createDelivery,
  createDriver,
  deleteDriver,
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

import {
  type UserRole,
  type Company,
  type UserProfile,
  type Driver,
  type DeliveryOrder,
  type AppWorkspace,
  type HomeScreenProps,
  type HomeTabKey,
  type DriverFilter,
  type DeliveryFilter,
  type DriverForm,
  type DeliveryForm,
  getOrderTitle,
  getOrderField,
  getOrderDestination,
  getOrderProducts,
  getAssignedDriverName,
  parseDeliveryFormDate,
  formatDateForInput,
  formatDateForDisplay,
  formatOrderDate,
  normalizeOrderStatus,
  getOrderStatusLabel,
  getBackendStatusLabel,
} from '../types/workspace';

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

  const handleDeleteDriver = async (driverId: string) => {
    setError('');
    try {
      await deleteDriver(driverId);
      setWorkspace((current) => ({
        ...current,
        drivers: current.drivers.filter((d) => d.id !== driverId),
      }));
      Alert.alert('Éxito', 'El chofer ha sido eliminado correctamente.');
    } catch (requestError) {
      const msg = getApiErrorMessage(requestError, 'No se pudo eliminar el chofer.');
      Alert.alert('Error', msg);
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
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {activeTab === 'home' ? (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => void loadWorkspace(true)} />
              }
            >
              <HomePanel
                workspace={workspace}
                setActiveTab={setActiveTab}
                setShowDeliveryForm={setShowDeliveryForm}
                setShowDriverForm={setShowDriverForm}
                setDeliveryFilter={setDeliveryFilter}
              />
            </ScrollView>
          ) : null}
          {activeTab === 'admins' ? (
            <AdminsPanel
              admins={workspace.admins}
              refreshing={refreshing}
              onRefresh={() => void loadWorkspace(true)}
            />
          ) : null}
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
              onDelete={handleDeleteDriver}
              refreshing={refreshing}
              onRefresh={() => void loadWorkspace(true)}
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
              refreshing={refreshing}
              onRefresh={() => void loadWorkspace(true)}
            />
          ) : null}
          {activeTab === 'map' ? (
            <MapPanel workspace={workspace} />
          ) : null}


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
