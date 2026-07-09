import { api } from './client';
import { type Driver } from './drivers';

export type Delivery = {
  id: string;
  empresa_id: string;
  chofer_id: string | null;
  cliente: string;
  cliente_dni?: string | null;
  producto: string;
  direccion_destino: string;
  fecha?: string;
  referencia: string | null;
  estado_id: number;
  estado?: { id: number; nombre_estado: string };
  chofer?: Pick<Driver, 'id' | 'nombre_completo' | 'email' | 'telefono'> | null;
  created_at: string;
};

export type CreateDeliveryPayload = {
  cliente: string;
  cliente_dni: string;
  producto: string;
  direccion_destino: string;
  fecha: string;
  referencia?: string;
};

export type UpdateDeliveryPayload = {
  cliente?: string;
  cliente_dni?: string;
  producto?: string;
  direccion_destino?: string;
  referencia?: string | null;
  orden_ruta?: number | null;
};

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

export async function updateDelivery(deliveryId: string, payload: UpdateDeliveryPayload) {
  const { data } = await api.patch<{ data: Delivery }>('/admin/entregas/' + deliveryId, payload);
  return data.data;
}

export async function deleteDelivery(deliveryId: string) {
  const { data } = await api.delete('/admin/entregas/' + deliveryId);
  return data;
}

export async function assignDriver(deliveryId: string, driverId: string | null) {
  const { data } = await api.patch<{ data: Delivery }>(
    '/admin/entregas/' + deliveryId + '/assign',
    { chofer_id: driverId },
  );
  return data.data;
}
