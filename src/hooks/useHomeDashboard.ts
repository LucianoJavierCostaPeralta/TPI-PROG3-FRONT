import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  acceptDelivery,
  assignDriver,
  createDelivery,
  createDriver,
  deleteDriver,
  getApiErrorMessage,
  getProfile,
  logout,
  updateDeliveryState,
} from '../services/api';
import { DNI_PATTERN, EMAIL_PATTERN, PHONE_PATTERN, isPastDate } from '../utils/validation';
import {
  deliveryToForm,
  emptyWorkspace,
  getTabs,
  getTitle,
  initialAdminNotifications,
  initialChoferNotifications,
  initialDeliveryForm,
  initialDriverForm,
  loadRoleData,
  mapDelivery,
  markOrderAsCancelled,
  normalizeRole,
} from '../utils/homeDashboard';
import {
  type AppNotification,
  type AppWorkspace,
  type DeliveryFilter,
  type DeliveryForm,
  type DeliveryOrder,
  type Driver,
  type DriverFilter,
  type DriverForm,
  type HomeScreenProps,
  type HomeTabKey,
  ORDER_STATUS,
} from '../types/workspace';

function createStatusNotification(
  action: string,
  orderId: string,
  profile: AppWorkspace['profile'],
): AppNotification | null {
  const id = String(Date.now());
  const shortOrderId = orderId.slice(0, 8).toUpperCase();
  const isChofer = profile.rol === 'chofer';

  if (action === 'accept') {
    return {
      id,
      titulo: isChofer ? 'Pedido aceptado' : 'Pedido Aceptado',
      mensaje: isChofer
        ? `Aceptaste realizar el pedido #${shortOrderId}.`
        : `El chofer ${profile.nombre} aceptó realizar el pedido #${shortOrderId}.`,
      tipo: 'success',
      leida: false,
      created_at: new Date().toISOString(),
    };
  }

  if (action === 'delivered') {
    return {
      id,
      titulo: isChofer ? 'Entrega finalizada' : 'Entrega Finalizada',
      mensaje: isChofer
        ? `Entregaste el pedido #${shortOrderId} con éxito.`
        : `El chofer ${profile.nombre} finalizó la entrega del pedido #${shortOrderId}.`,
      tipo: 'success',
      leida: false,
      created_at: new Date().toISOString(),
    };
  }

  if (action === 'cancelled') {
    return {
      id,
      titulo: isChofer ? 'Pedido cancelado' : 'Pedido Cancelado',
      mensaje: isChofer
        ? `Cancelaste el pedido #${shortOrderId}.`
        : `El chofer ${profile.nombre} canceló la entrega del pedido #${shortOrderId}.`,
      tipo: 'error',
      leida: false,
      created_at: new Date().toISOString(),
    };
  }

  return null;
}

export function useHomeDashboard({ navigation }: HomeScreenProps) {
  const params = useLocalSearchParams<{ openDrawer?: string; activeTab?: string }>();
  const router = useRouter();

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
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);

  const tabs = useMemo(() => getTabs(workspace.profile.rol), [workspace.profile.rol]);

  useEffect(() => {
    if (params.openDrawer === 'true') {
      setDrawerVisible(true);
      if (params.activeTab) {
        setActiveTab(params.activeTab as HomeTabKey);
      }
      router.setParams({ openDrawer: undefined, activeTab: undefined });
    }
  }, [params.openDrawer, params.activeTab, router]);

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
    }, [activeTab, isEditingDelivery, loadWorkspace, selectedDelivery, selectedDriver, showDeliveryForm, showDriverForm]),
  );

  const handleSignOut = useCallback(() => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
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
      ],
    );
  }, [navigation]);

  const updateDriverField = useCallback((field: keyof DriverForm, value: string) => {
    setDriverForm((current) => ({ ...current, [field]: value }));
  }, []);

  const updateDeliveryField = useCallback((field: keyof DeliveryForm, value: string) => {
    setDeliveryForm((current) => ({ ...current, [field]: value }));
  }, []);

  const validateDriverForm = useCallback(() => {
    if (!driverForm.nombre.trim()) return 'Ingresá el nombre del chofer.';
    if (!/^[\p{L}\s]+$/u.test(driverForm.nombre.trim()) || driverForm.nombre.trim().length < 3) {
      return 'El nombre debe tener al menos 3 letras y no puede contener números.';
    }
    if (!DNI_PATTERN.test(driverForm.documento)) return 'El DNI debe tener exactamente 8 números.';
    if (!isPastDate(driverForm.fechaNacimiento)) return 'Seleccioná una fecha de nacimiento anterior a hoy.';
    if (!EMAIL_PATTERN.test(driverForm.email.trim())) return 'Ingresá un correo válido, por ejemplo example@example.com.';
    if (driverForm.telefono && !PHONE_PATTERN.test(driverForm.telefono)) {
      return 'El teléfono debe contener entre 8 y 15 números.';
    }
    return null;
  }, [driverForm]);

  const validateDeliveryForm = useCallback((requireProducts: boolean) => {
    if (!deliveryForm.cliente.trim()) return 'Ingresá el cliente.';
    if (!deliveryForm.destino.trim()) return 'Ingresá el destino.';
    if (deliveryForm.cliente.trim().length < 2) return 'El nombre del cliente debe tener al menos 2 caracteres.';
    if (!DNI_PATTERN.test(deliveryForm.clienteDni)) return 'El DNI del cliente debe tener exactamente 8 números.';
    if (deliveryForm.destino.trim().length < 3) return 'El destino debe tener al menos 3 caracteres.';
    if (requireProducts && deliveryForm.productos.trim().length < 2) {
      return 'El producto debe tener al menos 2 caracteres.';
    }
    return null;
  }, [deliveryForm]);

  const handleCreateDriver = useCallback(async () => {
    const validationError = validateDriverForm();
    if (validationError) {
      setError(validationError);
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
  }, [driverForm, loadWorkspace, validateDriverForm]);

  const handleDeleteDriver = useCallback(async (driverId: string) => {
    setError('');
    try {
      await deleteDriver(driverId);
      setWorkspace((current) => ({
        ...current,
        drivers: current.drivers.filter((driver) => driver.id !== driverId),
      }));
      Alert.alert('Éxito', 'El chofer ha sido eliminado correctamente.');
    } catch (requestError) {
      Alert.alert('Error', getApiErrorMessage(requestError, 'No se pudo eliminar el chofer.'));
    }
  }, []);

  const handleCreateDelivery = useCallback(async () => {
    const validationError = validateDeliveryForm(true);
    if (validationError) {
      setError(validationError);
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
  }, [deliveryForm, loadWorkspace, validateDeliveryForm]);

  const handleAssignDriver = useCallback(async (orderId: string, driverId: string | null) => {
    setAssigningOrderId(orderId);
    setError('');

    try {
      await assignDriver(orderId, driverId);
      setSelectedDelivery((current) => (current?.id === orderId ? { ...current, chofer_id: driverId } : current));
      await loadWorkspace(true);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo asignar el chofer.'));
    } finally {
      setAssigningOrderId(null);
    }
  }, [loadWorkspace]);

  const handleEditDelivery = useCallback(async () => {
    if (!selectedDelivery) return;

    const validationError = validateDeliveryForm(false);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSavingDelivery(true);
    setError('');

    try {
      if (deliveryForm.choferId !== selectedDelivery.chofer_id) {
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
        orders: current.orders.map((order) => (order.id === selectedDelivery.id ? updatedOrder : order)),
      }));
      setSelectedDelivery(updatedOrder);
      setIsEditingDelivery(false);
      setDeliveryForm(initialDeliveryForm);
      await loadWorkspace(true);
      Alert.alert('Éxito', 'La entrega ha sido guardada correctamente.');
    } catch {
      setError('No se pudo guardar la edición.');
    } finally {
      setSavingDelivery(false);
    }
  }, [deliveryForm, loadWorkspace, selectedDelivery, validateDeliveryForm]);

  const handleUpdateOrderStatus = useCallback(async (orderId: string, action: string, clienteDni?: string) => {
    if (workspace.profile.rol === 'chofer' && (action === 'accept' || action === 'on_the_way')) {
      const activeOrder = workspace.orders.find(
        (order) =>
          (order.estado_id === ORDER_STATUS.ACCEPTED || order.estado_id === ORDER_STATUS.ON_THE_WAY) &&
          String(order.id) !== String(orderId),
      );
      if (activeOrder) {
        Alert.alert(
          'Pedido en curso',
          'Ya tienes un pedido activo. Debes completar o cancelar tu pedido actual antes de iniciar otro.',
        );
        return;
      }
    }

    setUpdatingOrderId(orderId);
    setError('');

    try {
      let updatedOrder: DeliveryOrder | null = null;

      if (action === 'accept') {
        updatedOrder = mapDelivery(await acceptDelivery(orderId));
      }
      if (action === 'on_the_way') {
        updatedOrder = mapDelivery(await updateDeliveryState(orderId, ORDER_STATUS.ON_THE_WAY));
      }
      if (action === 'delivered') {
        updatedOrder = mapDelivery(await updateDeliveryState(orderId, ORDER_STATUS.DELIVERED, clienteDni));
      }
      if (action === 'cancelled') {
        await markOrderAsCancelled(orderId);
        const found = workspace.orders.find((order) => order.id === orderId);
        if (found) {
          updatedOrder = { ...found, estado_id: ORDER_STATUS.CANCELLED, estado: 'cancelled' };
        }
      }

      const notification = createStatusNotification(action, orderId, workspace.profile);
      if (notification) {
        setWorkspace((prev) => ({
          ...prev,
          notifications: [notification, ...(prev.notifications || [])],
        }));
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
  }, [loadWorkspace, workspace.orders, workspace.profile]);

  const handleMarkAsRead = useCallback((id: string) => {
    setWorkspace((prev) => ({
      ...prev,
      notifications: prev.notifications.map((notification) =>
        notification.id === id ? { ...notification, leida: true } : notification,
      ),
    }));
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setWorkspace((prev) => ({
      ...prev,
      notifications: prev.notifications.map((notification) => ({ ...notification, leida: true })),
    }));
  }, []);

  const startEditingDelivery = useCallback(() => {
    if (!selectedDelivery) return;
    setDeliveryForm(deliveryToForm(selectedDelivery));
    setIsEditingDelivery(true);
  }, [selectedDelivery]);

  const cancelEditingDelivery = useCallback(() => {
    setIsEditingDelivery(false);
    setDeliveryForm(initialDeliveryForm);
  }, []);

  const cancelDeliveryForm = useCallback(() => {
    setShowDeliveryForm(false);
    setDeliveryForm(initialDeliveryForm);
  }, []);

  const toggleDeliveryForm = useCallback(() => {
    if (!showDeliveryForm) {
      setDeliveryForm(initialDeliveryForm);
    }
    setShowDeliveryForm((visible) => !visible);
  }, [showDeliveryForm]);

  const subtitle = useMemo(() => {
    if (workspace.profile.rol === 'asesor') return 'Panel de asesores.';
    if (workspace.profile.rol === 'chofer') return 'Tus pedidos asignados.';
    return workspace.company?.nombre ?? 'Gestioná tu empresa, choferes y pedidos.';
  }, [workspace.company?.nombre, workspace.profile.rol]);

  const headerNav = useMemo(() => {
    let title = getTitle(activeTab, workspace.profile.rol);
    let headerSubtitle = subtitle;
    let onBack: (() => void) | undefined;

    if (activeTab === 'drivers') {
      if (showDriverForm) {
        title = 'Nuevo Chofer';
        headerSubtitle = 'Registrar un conductor en la empresa';
        onBack = () => setShowDriverForm(false);
      } else if (selectedDriver) {
        title = 'Detalle de Chofer';
        headerSubtitle = 'Información de la cuenta';
        onBack = () => setSelectedDriver(null);
      }
    } else if (activeTab === 'deliveries') {
      if (showDeliveryForm) {
        title = 'Nueva Entrega';
        headerSubtitle = 'Crear un nuevo pedido';
        onBack = () => setShowDeliveryForm(false);
      } else if (selectedDelivery) {
        if (isEditingDelivery) {
          title = 'Editar entrega';
          headerSubtitle = 'Modificar datos del pedido';
          onBack = () => setIsEditingDelivery(false);
        } else {
          title = 'Detalle entrega';
          headerSubtitle = `Pedido #${selectedDelivery.id.slice(0, 8).toUpperCase()}`;
          onBack = () => setSelectedDelivery(null);
        }
      }
    } else if (activeTab === 'notifications') {
      title = 'Notificaciones';
      headerSubtitle = 'Alertas del sistema';
      onBack = () => setActiveTab('home');
    }

    return { title, subtitle: headerSubtitle, onBack };
  }, [activeTab, isEditingDelivery, selectedDelivery, selectedDriver, showDeliveryForm, showDriverForm, subtitle, workspace.profile.rol]);

  return {
    activeTab,
    assigningOrderId,
    cancelDeliveryForm,
    cancelEditingDelivery,
    deliveryFilter,
    deliveryForm,
    drawerVisible,
    driverFilter,
    driverForm,
    error,
    handleAssignDriver,
    handleCreateDelivery,
    handleCreateDriver,
    handleDeleteDriver,
    handleEditDelivery,
    handleMarkAllAsRead,
    handleMarkAsRead,
    handleSignOut,
    handleUpdateOrderStatus,
    headerNav,
    isEditingDelivery,
    loadWorkspace,
    loading,
    refreshing,
    savingDelivery,
    savingDriver,
    selectedDelivery,
    selectedDriver,
    setActiveTab,
    setDeliveryFilter,
    setDrawerVisible,
    setDriverFilter,
    setIsEditingDelivery,
    setSelectedDelivery,
    setSelectedDriver,
    setShowDeliveryForm,
    setShowDriverForm,
    showDeliveryForm,
    showDriverForm,
    startEditingDelivery,
    tabs,
    toggleDeliveryForm,
    unreadCount: workspace.notifications.filter((notification) => !notification.leida).length,
    updateDeliveryField,
    updateDriverField,
    updatingOrderId,
    workspace,
  };
}
