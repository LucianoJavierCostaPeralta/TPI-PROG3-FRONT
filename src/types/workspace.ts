/**
 * @file workspace.ts
 * @description Define los tipos de datos principales, interfaces de TypeScript, 
 * constantes de estado de pedidos y funciones auxiliares para formateo y 
 * geolocalización dentro del espacio de trabajo de la aplicación (TPI-PROG3-FRONT).
 * 
 * Contiene:
 * - Roles de usuarios (Administrador, Asesor, Chofer).
 * - Estructuras de datos para Choferes, Pedidos, Notificaciones y Empresas.
 * - Helpers de visualización de direcciones, fechas y cálculo de rutas de calles por OSRM.
 */

import axios from 'axios';

export type UserRole = 'administrador' | 'asesor' | 'chofer';

export type Company = {
  id: string;
  nombre: string;
  cuit: string | null;
  email: string | null;
  telefono: string | null;
};

export type UserProfile = {
  id: string;
  empresa_id: string | null;
  nombre: string;
  email: string;
  rol: UserRole;
  telefono: string | null;
  activo: boolean;
  created_at?: string;
};

export type Driver = {
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

export type DeliveryOrder = {
  id: string;
  empresa_id?: string | null;
  chofer_id?: string | null;
  estado?: string | null;
  estado_id?: number;
  cliente?: string | null;
  cliente_dni?: string | null;
  direccion_destino?: string | null;
  latitud?: string | number | null;
  longitud?: string | number | null;
  created_at?: string | null;
  updated_at?: string | null;
  referencia?: string | null;
  producto?: string | null;
  observaciones?: string | null;
  [key: string]: unknown;
};

export type AppNotification = {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'warning' | 'info' | 'error' | 'success';
  leida: boolean;
  created_at: string; // ISO string
};

export type AppWorkspace = {
  profile: UserProfile;
  company: Company | null;
  drivers: Driver[];
  orders: DeliveryOrder[];
  admins: UserProfile[];
  notifications: AppNotification[];
};

export type HomeScreenProps = {
  navigation?: {
    reset: (state: { index: number; routes: Array<{ name: string }> }) => void;
  };
};

export type HomeTabKey = 'home' | 'deliveries' | 'drivers' | 'admins' | 'map' | 'notifications';

export type DriverFilter = 'activos' | 'inactivos' | 'todos';
export type DeliveryFilter = 'todos' | 'pendiente' | 'en camino' | 'realizado';

export type DriverForm = {
  nombre: string;
  email: string;
  telefono: string;
  documento: string;
  fechaNacimiento: string;
};

export type DeliveryForm = {
  cliente: string;
  clienteDni: string;
  destino: string;
  referencia: string;
  observaciones: string;
  fecha: string;
  productos: string;
  choferId?: string | null;
};

// HELPER FUNCTIONS FOR RENDERING AND DATE PARSING

export function getOrderTitle(order: DeliveryOrder) {
  const possibleTitle = order.codigo ?? order.numero ?? order.nombre ?? order.id;
  return `Pedido ${String(possibleTitle).slice(0, 12)}`;
}

export function getOrderField(order: DeliveryOrder, fields: string[]) {
  for (const field of fields) {
    const value = order[field];
    if (value !== null && value !== undefined && String(value).trim()) {
      return String(value);
    }
  }
  return null;
}

export function getOrderDestination(order: DeliveryOrder) {
  return getOrderField(order, ['direccion_destino', 'destino', 'direccion', 'direccion_entrega', 'domicilio']) ?? 'Destino sin cargar';
}

export function getOrderProducts(order: DeliveryOrder) {
  const productos = order.producto ?? order.productos ?? order.items ?? order.detalle;

  if (Array.isArray(productos)) {
    return `${productos.length} producto${productos.length === 1 ? '' : 's'}`;
  }

  if (typeof productos === 'string' && productos.trim()) {
    return productos;
  }

  return null;
}

export function getAssignedDriverName(order: DeliveryOrder) {
  const chofer = order.chofer;
  if (chofer && typeof chofer === 'object' && 'nombre_completo' in chofer) {
    return String(chofer.nombre_completo);
  }
  return null;
}

export function parseDeliveryFormDate(value: string) {
  if (!value) return new Date();

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatDateForDisplay(value: string) {
  if (!value) return '';

  const date = parseDeliveryFormDate(value);
  return date.toLocaleDateString();
}

export function formatOrderDate(order: DeliveryOrder) {
  const value = getOrderField(order, ['fecha_programada', 'fecha', 'fecha_entrega', 'created_at']);
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString();
}

export function normalizeOrderStatus(status: unknown): DeliveryFilter {
  const normalized = String(status ?? 'pendiente').toLowerCase().trim();

  if (['5', '6', 'realizado', 'entregado', 'entregada', 'delivered', 'finalizado'].includes(normalized)) return 'realizado';
  if (['4', 'en camino', 'en_camino', 'encamino', 'on the way', 'on_the_way'].includes(normalized)) return 'en camino';

  return 'pendiente';
}

export function getOrderStatusLabel(status: DeliveryFilter) {
  if (status === 'en camino') return 'En camino';
  if (status === 'realizado') return 'Realizado';
  return 'Pendiente';
}

export function getBackendStatusLabel(order: DeliveryOrder) {
  if (order.estado_id === 5 || order.estado_id === 6) {
    return 'Finalizado';
  }
  const status = String(order.estado ?? '').trim();
  if (status && !/^\d+$/.test(status)) {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
  return getOrderStatusLabel(normalizeOrderStatus(status));
}

export function getDeliveryCoordinates(order: DeliveryOrder, index: number) {
  // Coordenadas de Resistencia, Chaco
  const baseLat = -27.4511;
  const baseLng = -58.9866;

  // Generar offsets deterministas basados en el ID del pedido
  const idStr = order.id || '';
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Pequeña dispersión geográfica (radio de ~2-3 km)
  const latOffset = ((Math.abs(hash) % 150) / 4000) * (index % 2 === 0 ? 1 : -1);
  const lngOffset = ((Math.abs(hash >> 8) % 150) / 4000) * (index % 3 === 0 ? 1 : -1);

  return {
    latitude: baseLat + latOffset,
    longitude: baseLng + lngOffset,
  };
}

export async function fetchStreetRoute(coordinates: { latitude: number; longitude: number }[]) {
  if (coordinates.length < 2) return [];

  // OSRM requiere las coordenadas en formato "longitud,latitud" separadas por ";"
  const coordsQuery = coordinates.map(c => `${c.longitude},${c.latitude}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordsQuery}?overview=full&geometries=geojson`;

  try {
    const { data } = await axios.get(url, { timeout: 8000 });

    if (data.code === 'Ok' && data.routes && data.routes[0]?.geometry?.coordinates) {
      const routePoints = data.routes[0].geometry.coordinates;
      // OSRM responde con [longitud, latitud], lo convertimos al formato de React Native Maps
      return routePoints.map(([lng, lat]: [number, number]) => ({
        latitude: lat,
        longitude: lng,
      }));
    }
  } catch (error) {
    console.error('Error al obtener la ruta de calles de OSRM:', error);
  }

  return [];
}

export const ORDER_STATUS = {
  PENDING: 1,
  ASSIGNED: 2,
  ACCEPTED: 3,
  ON_THE_WAY: 4,
  DELIVERED: 5,
  FINISHED: 6,
  CANCELLED: 7,
} as const;
