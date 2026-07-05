import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, RefreshControl, ScrollView, StyleSheet, View, TouchableOpacity, BackHandler } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
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
import { HomePanel, DriversPanel, DeliveriesPanel, AdminsPanel, MapPanel, DeliveryDetailPanel, DeliveryEditPanel, NotificationsPanel } from '../components/organisms';
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
  AppNotification,
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
  choferId: null,
};

const initialAdminNotifications: AppNotification[] = [
  {
    id: 'admin-1',
    titulo: 'Entrega retrasada',
    mensaje: 'La entrega #ENT-204 presenta un retraso de 25 minutos.',
    tipo: 'warning',
    leida: false,
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'admin-2',
    titulo: 'Chofer desconectado',
    mensaje: 'El chofer Juan Pérez perdió conexión con el sistema.',
    tipo: 'error',
    leida: false,
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'admin-3',
    titulo: 'Entrega completada',
    mensaje: 'La entrega #ENT-198 fue completada correctamente.',
    tipo: 'success',
    leida: true,
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
];

const initialChoferNotifications: AppNotification[] = [
  {
    id: 'chofer-1',
    titulo: 'Nuevo pedido asignado',
    mensaje: 'Se te ha asignado el pedido #PED-0002. Por favor, revisá los detalles de la entrega.',
    tipo: 'info',
    leida: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'chofer-2',
    titulo: 'Asignación removida',
    mensaje: 'Se te ha quitado la asignación del pedido #PED-0005.',
    tipo: 'warning',
    leida: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

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
  notifications: initialAdminNotifications,
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

  const params = useLocalSearchParams<{ openDrawer?: string; activeTab?: string }>();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<HomeTabKey>('home');
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    if (params.openDrawer === 'true') {
      setDrawerVisible(true);
      if (params.activeTab) {
        setActiveTab(params.activeTab as HomeTabKey);
      }
      router.setParams({ openDrawer: undefined, activeTab: undefined });
    }
  }, [params.openDrawer, params.activeTab]);
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
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);

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

      if (role === 'chofer' && roleData.orders.length > 0) {
        const sorted = [...roleData.orders].sort(
          (a, b) => (Number(a.orden_ruta) || 0) - (Number(b.orden_ruta) || 0)
        );
        const firstPending = sorted.find(
          o => !(o.estado_id === 5 || o.estado_id === 6 || o.estado === 'realizado' || o.estado === 'entregado')
        );
        if (firstPending && (firstPending.estado_id === 2 || firstPending.estado_id === 3)) {
          try {
            await updateDeliveryState(firstPending.id, 4);
            const updatedRoleData = await loadRoleData(user, role);
            roleData.orders = updatedRoleData.orders;
          } catch (e) {
            // Silently ignore or log auto-start failures
          }
        }
      }

      setWorkspace((prev) => ({
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
        notifications: prev.notifications.length > 0 && prev.profile.rol === role
          ? prev.notifications
          : (role === 'chofer' ? initialChoferNotifications : initialAdminNotifications),
      }));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo cargar el perfil.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleMarkAsRead = (id: string) => {
    setWorkspace((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, leida: true } : n
      ),
    }));
  };

  const handleMarkAllAsRead = () => {
    setWorkspace((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, leida: true })),
    }));
  };

  useFocusEffect(
    useCallback(() => {
      void loadWorkspace();

      const handleBackPress = () => {
        if (selectedDelivery) {
          if (isEditingDelivery) {
            setIsEditingDelivery(false);
          } else {
            setSelectedDelivery(null);
          }
          return true;
        }
        if (selectedDriver) {
          setSelectedDriver(null);
          return true;
        }
        if (showDeliveryForm) {
          setShowDeliveryForm(false);
          return true;
        }
        if (showDriverForm) {
          setShowDriverForm(false);
          return true;
        }
        if (activeTab !== 'home') {
          setActiveTab('home');
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => subscription.remove();
    }, [loadWorkspace, selectedDelivery, isEditingDelivery, selectedDriver, showDeliveryForm, showDriverForm, activeTab])
  );

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } finally {
              navigation?.reset({
                index: 0,
                routes: [{ name: 'LoginScreen' }],
              });
            }
          },
        },
      ]
    );
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
      const newDelivery = await createDelivery({
        cliente: deliveryForm.cliente.trim(),
        cliente_dni: deliveryForm.clienteDni,
        producto: deliveryForm.productos.trim(),
        direccion_destino: deliveryForm.destino.trim(),
        referencia: deliveryForm.referencia.trim() || deliveryForm.observaciones.trim() || undefined,
      });
      if (deliveryForm.choferId) {
        await assignDriver(newDelivery.id, deliveryForm.choferId);
      }
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
      setSelectedDelivery((current) => {
        if (current && current.id === orderId) {
          return { ...current, chofer_id: driverId };
        }
        return current;
      });
      await loadWorkspace(true);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo asignar el chofer.'));
    } finally {
      setAssigningOrderId(null);
    }
  };

  const handleEditDelivery = async () => {
    if (!selectedDelivery) return;

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

    setSavingDelivery(true);
    setError('');

    try {
      const hasDriverChanged = deliveryForm.choferId !== selectedDelivery.chofer_id;
      if (hasDriverChanged) {
        await assignDriver(selectedDelivery.id, deliveryForm.choferId || null);
      }

      const updatedOrder: DeliveryOrder = {
        ...selectedDelivery,
        cliente: deliveryForm.cliente.trim(),
        cliente_dni: deliveryForm.clienteDni,
        direccion_destino: deliveryForm.destino.trim(),
        referencia: deliveryForm.referencia.trim(),
        producto: deliveryForm.productos.trim(),
        observaciones: deliveryForm.observaciones.trim(),
        chofer_id: deliveryForm.choferId || null,
        created_at: deliveryForm.fecha ? `${deliveryForm.fecha}T12:00:00.000000Z` : selectedDelivery.created_at,
      };

      setWorkspace((current) => ({
        ...current,
        orders: current.orders.map((o) => (o.id === selectedDelivery.id ? updatedOrder : o)),
      }));

      setSelectedDelivery(updatedOrder);
      setIsEditingDelivery(false);
      setDeliveryForm(initialDeliveryForm);
      await loadWorkspace(true);
      Alert.alert('Éxito', 'La entrega ha sido guardada correctamente.');
    } catch (requestError) {
      setError('No se pudo guardar la edición.');
    } finally {
      setSavingDelivery(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, action: string, clienteDni?: string) => {
    setUpdatingOrderId(orderId);
    setError('');

    try {
      let updatedOrder: DeliveryOrder | null = null;
      if (action === 'accept') {
        const res = await acceptDelivery(orderId);
        updatedOrder = mapDelivery(res);
        
        // Simular notificación locales
        setWorkspace((prev) => {
          const isChofer = prev.profile.rol === 'chofer';
          const newNotif = isChofer ? {
            id: String(Date.now()),
            titulo: 'Pedido aceptado',
            mensaje: `Aceptaste realizar el pedido #${orderId.slice(0, 8).toUpperCase()}.`,
            tipo: 'success' as const,
            leida: false,
            created_at: new Date().toISOString(),
          } : {
            id: String(Date.now()),
            titulo: 'Pedido Aceptado',
            mensaje: `El chofer ${prev.profile.nombre} aceptó realizar el pedido #${orderId.slice(0, 8).toUpperCase()}.`,
            tipo: 'success' as const,
            leida: false,
            created_at: new Date().toISOString(),
          };
          return {
            ...prev,
            notifications: [newNotif, ...(prev.notifications || [])],
          };
        });
      }
      if (action === 'on_the_way') {
        const res = await updateDeliveryState(orderId, 4);
        updatedOrder = mapDelivery(res);
      }
      if (action === 'delivered') {
        const res = await updateDeliveryState(orderId, 5, clienteDni);
        updatedOrder = mapDelivery(res);

        // Simular notificación locales según rol
        setWorkspace((prev) => {
          const isChofer = prev.profile.rol === 'chofer';
          const newNotif = isChofer ? {
            id: String(Date.now()),
            titulo: 'Entrega finalizada',
            mensaje: `Entregaste el pedido #${orderId.slice(0, 8).toUpperCase()} con éxito.`,
            tipo: 'success' as const,
            leida: false,
            created_at: new Date().toISOString(),
          } : {
            id: String(Date.now()),
            titulo: 'Entrega Finalizada',
            mensaje: `El chofer ${prev.profile.nombre} finalizó la entrega del pedido #${orderId.slice(0, 8).toUpperCase()}.`,
            tipo: 'success' as const,
            leida: false,
            created_at: new Date().toISOString(),
          };
          return {
            ...prev,
            notifications: [newNotif, ...(prev.notifications || [])],
          };
        });

        // Auto-iniciar la siguiente parada si el rol es chofer
        if (workspace.profile.rol === 'chofer') {
          const driverOrders = workspace.orders.filter(o => o.chofer_id === workspace.profile.id);
          const sorted = [...driverOrders].sort(
            (a, b) => (Number(a.orden_ruta) || 0) - (Number(b.orden_ruta) || 0)
          );
          const nextPending = sorted.find(
            o => o.id !== orderId && !(o.estado_id === 5 || o.estado_id === 6 || o.estado === 'realizado' || o.estado === 'entregado')
          );
          if (nextPending) {
            await updateDeliveryState(nextPending.id, 4);
          }
        }
      }

      if (updatedOrder) {
        setSelectedDelivery(updatedOrder);
      }
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

  const headerNav = useMemo(() => {
    let titleVal = getTitle(activeTab, workspace.profile.rol);
    let subtitleVal = subtitle;
    let onBack: (() => void) | undefined = undefined;

    if (activeTab === 'drivers') {
      if (showDriverForm) {
        titleVal = 'Nuevo Chofer';
        subtitleVal = 'Registrar un conductor en la empresa';
        onBack = () => setShowDriverForm(false);
      } else if (selectedDriver) {
        titleVal = 'Detalle de Chofer';
        subtitleVal = 'Información de la cuenta';
        onBack = () => setSelectedDriver(null);
      }
    } else if (activeTab === 'deliveries') {
      if (showDeliveryForm) {
        titleVal = 'Nueva Entrega';
        subtitleVal = 'Crear un nuevo pedido';
        onBack = () => setShowDeliveryForm(false);
      } else if (selectedDelivery) {
        if (isEditingDelivery) {
          titleVal = 'Editar entrega';
          subtitleVal = 'Modificar datos del pedido';
          onBack = () => setIsEditingDelivery(false);
        } else {
          titleVal = 'Detalle entrega';
          subtitleVal = `Pedido #${selectedDelivery.id.slice(0, 8).toUpperCase()}`;
          onBack = () => setSelectedDelivery(null);
        }
      }
    } else if (activeTab === 'notifications') {
      titleVal = 'Notificaciones';
      subtitleVal = 'Alertas del sistema';
      onBack = () => setActiveTab('home');
    }

    return { title: titleVal, subtitle: subtitleVal, onBack };
  }, [activeTab, workspace.profile.rol, subtitle, showDriverForm, showDeliveryForm, selectedDriver, selectedDelivery, isEditingDelivery]);

  return (
    <HomeTemplate
      title={headerNav.title}
      subtitle={headerNav.subtitle}
      onBack={headerNav.onBack}
      tabs={tabs}
      activeTab={activeTab}
      drawerVisible={drawerVisible}
      onTabChange={setActiveTab}
      onOpenDrawer={() => setDrawerVisible(true)}
      onCloseDrawer={() => setDrawerVisible(false)}
      onSignOut={handleSignOut}
      onBellPress={() => setActiveTab('notifications')}
      bellActive={activeTab === 'notifications'}
      unreadCount={workspace.notifications ? workspace.notifications.filter((n) => !n.leida).length : 0}
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
                onUpdateStatus={handleUpdateOrderStatus}
                updatingOrderId={updatingOrderId}
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
              orders={workspace.orders}
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
              selectedDriver={selectedDriver}
              setSelectedDriver={setSelectedDriver}
            />
          ) : null}
          {activeTab === 'deliveries' ? (
            isEditingDelivery && selectedDelivery ? (
              <DeliveryEditPanel
                form={deliveryForm}
                drivers={workspace.drivers}
                onChange={updateDeliveryField}
                onSubmit={handleEditDelivery}
                onCancel={() => {
                  setIsEditingDelivery(false);
                  setDeliveryForm(initialDeliveryForm);
                }}
                saving={savingDelivery}
              />
            ) : selectedDelivery ? (
              <DeliveryDetailPanel
                order={selectedDelivery}
                drivers={workspace.drivers}
                role={workspace.profile.rol}
                onEdit={() => {
                  setDeliveryForm({
                    cliente: selectedDelivery.cliente || '',
                    clienteDni: selectedDelivery.cliente_dni || '',
                    destino: selectedDelivery.direccion_destino || '',
                    referencia: selectedDelivery.referencia || '',
                    fecha: selectedDelivery.created_at ? selectedDelivery.created_at.split('T')[0] : '',
                    productos: selectedDelivery.producto || '',
                    observaciones: selectedDelivery.observaciones || '',
                    choferId: selectedDelivery.chofer_id || null,
                  });
                  setIsEditingDelivery(true);
                }}
                onUpdateStatus={handleUpdateOrderStatus}
                onViewOnMap={(order) => {
                  setActiveTab('map');
                }}
                updatingOrderId={updatingOrderId}
              />
            ) : (
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
                onCancel={() => {
                  setShowDeliveryForm(false);
                  setDeliveryForm(initialDeliveryForm);
                }}
                onAssign={handleAssignDriver}
                onUpdateStatus={handleUpdateOrderStatus}
                refreshing={refreshing}
                onRefresh={() => void loadWorkspace(true)}
                setSelectedDelivery={setSelectedDelivery}
              />
            )
          ) : null}
          {activeTab === 'map' ? (
            <MapPanel workspace={workspace} initialFocusOrderId={selectedDelivery?.id} />
          ) : null}
          {activeTab === 'notifications' ? (
            <NotificationsPanel
              notifications={workspace.notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
            />
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
              onPress={() => {
                if (!showDeliveryForm) {
                  setDeliveryForm(initialDeliveryForm);
                }
                setShowDeliveryForm((visible) => !visible);
              }}
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
    notifications: 'Notificaciones',
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
