import { api } from './client';

export type Driver = {
  id: string;
  empresa_id: string;
  nombre_completo: string;
  email: string;
  telefono: string | null;
  dni: string;
  fecha_nacimiento: string;
  activo: boolean;
  created_at: string;
};

export type Delivery = {
  id: string;
  empresa_id: string;
  chofer_id: string | null;
  cliente: string;
  producto: string;
  direccion_destino: string;
  referencia: string | null;
  estado_id: number;
  estado?: { id: number; nombre_estado: string };
  chofer?: Pick<Driver, 'id' | 'nombre_completo' | 'email' | 'telefono'> | null;
  created_at: string;
};

export type CreateDriverPayload = {
  nombre_completo: string;
  dni: string;
  fecha_nacimiento: string;
  email: string;
  telefono?: string;
  password: string;
};

export type CreateDeliveryPayload = {
  cliente: string;
  cliente_dni: string;
  producto: string;
  direccion_destino: string;
  referencia?: string;
};

export async function listDrivers() {
  const { data } = await api.get<{ data: Driver[] }>('/admin/choferes');
  return data.data;
}

export async function createDriver(payload: CreateDriverPayload) {
  const { data } = await api.post<{ data: Driver }>('/admin/choferes', payload);
  return data.data;
}

export async function listAdminDeliveries() {
  const { data } = await api.get<{ data: { data: Delivery[] } }>('/admin/entregas', {
    params: { per_page: 100 },
  });
  return data.data.data;
}

export async function createDelivery(payload: CreateDeliveryPayload) {
  const { data } = await api.post<{ data: Delivery }>('/admin/entregas', payload);
  return data.data;
}

export async function assignDriver(deliveryId: string, driverId: string | null) {
  const { data } = await api.patch<{ data: Delivery }>(
    `/admin/entregas/${deliveryId}/assign`,
    { chofer_id: driverId },
  );
  return data.data;
}

export async function listDriverDeliveries() {
  const { data } = await api.get<{ data: Delivery[] }>('/chofer/entregas');
  return data.data;
}

export async function acceptDelivery(deliveryId: string) {
  const { data } = await api.patch<{ data: Delivery }>(
    `/chofer/entregas/${deliveryId}/accept`,
  );
  return data.data;
}

export async function updateDeliveryState(deliveryId: string, estadoId: 4 | 5 | 7, clienteDni?: string) {
  const { data } = await api.patch<{ data: Delivery }>(
    `/chofer/entregas/${deliveryId}/state`,
    { estado_id: estadoId, ...(clienteDni ? { cliente_dni: clienteDni } : {}) },
  );
  return data.data;
}

export async function deleteDriver(driverId: string) {
  const { data } = await api.delete(`/admin/choferes/${driverId}`);
  return data;
}
