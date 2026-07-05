import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
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
import { type BottomTabMenuItem } from '../components/molecules';

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
  fecha_nacimiento?: string | null;
};

type DeliveryOrder = {
  id: string;
  empresa_id?: string | null;
  chofer_id?: string | null;
  estado?: string | null;
  estado_id?: number;
  cliente?: string | null;
  cliente_dni?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  referencia?: string | null;
  producto?: string | null;
  observaciones?: string | null;
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
  choferId?: string | null;
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
    fecha_nacimiento: driver.fecha_nacimiento,
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

export function useHomeDashboard({ navigation }: HomeScreenProps) {
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

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
    } finally {
      navigation?.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    }
  }, [navigation]);

  const updateDriverField = useCallback((field: keyof DriverForm, value: string) => {
    setDriverForm((current) => ({ ...current, [field]: value }));
  }, []);

  const updateDeliveryField = useCallback((field: keyof DeliveryForm, value: string) => {
    setDeliveryForm((current) => ({ ...current, [field]: value }));
  }, []);

  const handleCreateDriver = useCallback(async () => {
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
  }, [driverForm, loadWorkspace]);

  const handleCreateDelivery = useCallback(async () => {
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
  }, [deliveryForm, loadWorkspace]);

  const handleAssignDriver = useCallback(async (orderId: string, driverId: string | null) => {
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
  }, [loadWorkspace]);

  const handleUpdateOrderStatus = useCallback(async (orderId: string, action: string, clienteDni?: string) => {
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
  }, [loadWorkspace]);

  const subtitle = useMemo(() => {
    if (workspace.profile.rol === 'asesor') {
      return 'Panel de asesores.';
    }

    if (workspace.profile.rol === 'chofer') {
      return 'Tus pedidos asignados.';
    }

    return workspace.company?.nombre ?? 'Gestioná tu empresa, choferes y pedidos.';
  }, [workspace.company?.nombre, workspace.profile.rol]);

  const handleOpenMap = useCallback(() => setActiveTab('map'), []);
  const handleOpenDriverForm = useCallback(() => {
    setActiveTab('drivers');
    setShowDriverForm(true);
  }, []);
  const handleOpenDeliveryForm = useCallback(() => {
    setActiveTab('deliveries');
    setShowDeliveryForm(true);
  }, []);

  return {
    activeTab,
    setActiveTab,
    drawerVisible,
    setDrawerVisible,
    workspace,
    loading,
    refreshing,
    savingDriver,
    savingDelivery,
    showDriverForm,
    setShowDriverForm,
    showDeliveryForm,
    setShowDeliveryForm,
    driverFilter,
    setDriverFilter,
    deliveryFilter,
    setDeliveryFilter,
    assigningOrderId,
    updatingOrderId,
    error,
    setError,
    driverForm,
    deliveryForm,
    loadWorkspace,
    handleSignOut,
    updateDriverField,
    updateDeliveryField,
    handleCreateDriver,
    handleCreateDelivery,
    handleAssignDriver,
    handleUpdateOrderStatus,
    handleOpenMap,
    handleOpenDriverForm,
    handleOpenDeliveryForm,
    subtitle,
    tabs,
  };
}

export type {
  AppWorkspace,
  Company,
  DeliveryFilter,
  DeliveryForm,
  DeliveryOrder,
  Driver,
  DriverFilter,
  DriverForm,
  HomeScreenProps,
  HomeTabKey,
  UserProfile,
  UserRole,
};
