import { type AppWorkspace, type DeliveryOrder, ORDER_STATUS, normalizeOrderStatus } from '../../types/workspace';

export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

export type MapOrder = DeliveryOrder & {
  latitud: number;
  longitud: number;
};

export type MapDriverPin = {
  id: string;
  nombre: string;
  coordinate: MapCoordinate;
};

export const MAP_DEFAULT_COORDINATE: MapCoordinate = {
  latitude: -27.4511,
  longitude: -58.9866,
};

export const MAP_INITIAL_REGION = {
  ...MAP_DEFAULT_COORDINATE,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const CANCELLED_STATUS_VALUES = ['7', 'cancelado', 'cancelled'];

function isCancelledOrder(order: DeliveryOrder) {
  return order.estado_id === ORDER_STATUS.CANCELLED
    || CANCELLED_STATUS_VALUES.includes(String(order.estado || '').toLowerCase());
}

function getDeliveryCoordinates(order: DeliveryOrder, index: number): MapCoordinate {
  const idStr = order.id || '';
  let hash = 0;

  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }

  const latOffset = ((Math.abs(hash) % 150) / 4000) * (index % 2 === 0 ? 1 : -1);
  const lngOffset = ((Math.abs(hash >> 8) % 150) / 4000) * (index % 3 === 0 ? 1 : -1);

  return {
    latitude: MAP_DEFAULT_COORDINATE.latitude + latOffset,
    longitude: MAP_DEFAULT_COORDINATE.longitude + lngOffset,
  };
}

export function buildMapOrders(workspace: AppWorkspace, selectedDriverId: string | null) {
  const isChofer = workspace.profile.rol === 'chofer';
  let ordersToDisplay = workspace.orders || [];

  ordersToDisplay = ordersToDisplay.filter((order) => !isCancelledOrder(order));

  if (isChofer) {
    ordersToDisplay = ordersToDisplay.filter((order) => order.chofer_id === workspace.profile.id);
  } else if (selectedDriverId) {
    ordersToDisplay = ordersToDisplay.filter((order) => order.chofer_id === selectedDriverId);
  }

  return [...ordersToDisplay]
    .sort((a, b) => (Number(a.orden_ruta) || 0) - (Number(b.orden_ruta) || 0))
    .map((order, index) => {
      const coordinates = getDeliveryCoordinates(order, index);
      return {
        ...order,
        latitud: coordinates.latitude,
        longitud: coordinates.longitude,
      };
    });
}

export function getCompletedMapOrders(mapOrders: MapOrder[]) {
  return mapOrders.filter((order) => normalizeOrderStatus(order.estado) === 'realizado');
}

export function getPendingMapOrders(mapOrders: MapOrder[]) {
  return mapOrders.filter((order) => normalizeOrderStatus(order.estado) !== 'realizado');
}

export function getMapSelectedOrder(mapOrders: MapOrder[], selectedMapOrderId: string | null) {
  if (!selectedMapOrderId) return null;
  return mapOrders.find((order) => order.id === selectedMapOrderId) || null;
}

export function getMapDriverCoordinate(mapOrders: MapOrder[]) {
  const pendingOrders = getPendingMapOrders(mapOrders);

  if (pendingOrders.length > 0) {
    const activeOrder = pendingOrders.find(
      (order) => order.estado_id === ORDER_STATUS.ACCEPTED || order.estado_id === ORDER_STATUS.ON_THE_WAY
    );
    const firstPending = activeOrder || pendingOrders[0];
    return {
      latitude: Number(firstPending.latitud) - 0.0018,
      longitude: Number(firstPending.longitud) - 0.0015,
    };
  }

  if (mapOrders.length > 0) {
    const last = mapOrders[mapOrders.length - 1];
    return {
      latitude: Number(last.latitud),
      longitude: Number(last.longitud),
    };
  }

  return MAP_DEFAULT_COORDINATE;
}

export function getActiveDriversOnMap(workspace: AppWorkspace, selectedDriverId: string | null) {
  const isChofer = workspace.profile.rol === 'chofer';

  if (isChofer || selectedDriverId) {
    return [];
  }

  const drivers = workspace.drivers || [];
  const limit = 3;
  const selectedDrivers = drivers.slice(0, limit);

  return selectedDrivers.map((driver) => {
    const driverOrders = (workspace.orders || []).filter((order) => order.chofer_id === driver.id);
    const sorted = [...driverOrders].sort((a, b) => (Number(a.orden_ruta) || 0) - (Number(b.orden_ruta) || 0));
    const pending = sorted.filter((order) => normalizeOrderStatus(order.estado) !== 'realizado');

    let coordinate = MAP_DEFAULT_COORDINATE;

    if (pending.length > 0) {
      const firstPending = pending[0];
      const coordinates = getDeliveryCoordinates(firstPending, 0);
      coordinate = {
        latitude: coordinates.latitude - 0.0018,
        longitude: coordinates.longitude - 0.0015,
      };
    } else if (sorted.length > 0) {
      const last = sorted[sorted.length - 1];
      const coordinates = getDeliveryCoordinates(last, 0);
      coordinate = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      };
    } else {
      const indexOffset = drivers.indexOf(driver) * 0.005;
      coordinate = {
        latitude: MAP_DEFAULT_COORDINATE.latitude + indexOffset,
        longitude: MAP_DEFAULT_COORDINATE.longitude - indexOffset,
      };
    }

    return {
      id: driver.id,
      nombre: driver.nombre,
      coordinate,
    };
  });
}

export function getActiveDriverName(workspace: AppWorkspace, selectedDriverId: string | null) {
  if (workspace.profile.rol === 'chofer') {
    return workspace.profile.nombre;
  }

  if (selectedDriverId) {
    const driver = workspace.drivers.find((item) => item.id === selectedDriverId);
    return driver ? driver.nombre : 'Chofer seleccionado';
  }

  return null;
}
