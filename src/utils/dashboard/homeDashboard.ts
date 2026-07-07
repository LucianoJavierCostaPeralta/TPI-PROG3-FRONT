import AsyncStorage from '@react-native-async-storage/async-storage';
import { type BottomTabMenuItem } from '../../components/molecules';
import {
  listAdminDeliveries,
  listDriverDeliveries,
  listDrivers,
  type AuthUser,
  type Delivery,
  type Driver as ApiDriver,
} from '../../services/api';
import {
  type AppNotification,
  type AppWorkspace,
  type DeliveryForm,
  type DeliveryOrder,
  type DriverForm,
  type HomeTabKey,
  type UserRole,
  ORDER_STATUS,
} from '../../types/workspace';

export const initialDriverForm: DriverForm = {
  nombre: '',
  email: '',
  telefono: '',
  documento: '',
  fechaNacimiento: '',
};

export const initialDeliveryForm: DeliveryForm = {
  cliente: '',
  clienteDni: '',
  destino: '',
  referencia: '',
  observaciones: '',
  fecha: '',
  productos: '',
  choferId: null,
};

export const initialAdminNotifications: AppNotification[] = [
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

export const initialChoferNotifications: AppNotification[] = [
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

export const emptyWorkspace: AppWorkspace = {
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

const CANCELLED_ORDERS_KEY = 'zonescore:cancelled_orders';

export function normalizeRole(role?: string): UserRole {
  const normalized = role?.toLowerCase();
  if (normalized === 'chofer' || normalized === 'asesor') return normalized;
  return 'administrador';
}

export function mapDriver(driver: ApiDriver) {
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

export function mapDelivery(delivery: Delivery): DeliveryOrder {
  return {
    ...delivery,
    id: String(delivery.id),
    estado: delivery.estado?.nombre_estado ?? String(delivery.estado_id),
    destino: delivery.direccion_destino,
    productos: delivery.producto,
  };
}

export async function getCancelledOrderIds(): Promise<string[]> {
  try {
    const stored = await AsyncStorage.getItem(CANCELLED_ORDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export async function markOrderAsCancelled(orderId: string): Promise<void> {
  try {
    const current = await getCancelledOrderIds();
    if (!current.includes(orderId)) {
      current.push(orderId);
      await AsyncStorage.setItem(CANCELLED_ORDERS_KEY, JSON.stringify(current));
    }
  } catch (e) {
    console.error('Error storing cancelled order:', e);
  }
}

function applyCancelledState(order: DeliveryOrder, cancelledIds: string[]) {
  if (!cancelledIds.includes(order.id)) return order;
  return {
    ...order,
    estado_id: ORDER_STATUS.CANCELLED,
    estado: 'cancelled',
  };
}

export async function loadRoleData(_user: AuthUser, role: UserRole) {
  const cancelledIds = await getCancelledOrderIds();

  if (role === 'chofer') {
    const deliveries = await listDriverDeliveries();
    return {
      drivers: [],
      orders: deliveries.map((delivery) => applyCancelledState(mapDelivery(delivery), cancelledIds)),
    };
  }

  if (role === 'administrador') {
    const [drivers, orders] = await Promise.all([listDrivers(), listAdminDeliveries()]);
    return {
      drivers: drivers.map(mapDriver),
      orders: orders.map((order) => applyCancelledState(mapDelivery(order), cancelledIds)),
    };
  }

  return { drivers: [], orders: [] };
}

export function getTabs(role: AppWorkspace['profile']['rol']): Array<BottomTabMenuItem<HomeTabKey>> {
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

export function getTitle(activeTab: HomeTabKey, role: AppWorkspace['profile']['rol']) {
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

export function deliveryToForm(delivery: DeliveryOrder): DeliveryForm {
  return {
    cliente: delivery.cliente || '',
    clienteDni: delivery.cliente_dni || '',
    destino: delivery.direccion_destino || '',
    referencia: delivery.referencia || '',
    fecha: delivery.created_at ? delivery.created_at.split('T')[0] : '',
    productos: delivery.producto || '',
    observaciones: delivery.observaciones || '',
    choferId: delivery.chofer_id || null,
  };
}
