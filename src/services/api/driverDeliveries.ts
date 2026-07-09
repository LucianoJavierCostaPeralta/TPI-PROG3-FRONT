import { api } from './client';
import { type Delivery } from './adminDeliveries';

export async function listDriverDeliveries() {
  const { data } = await api.get<{ data: Delivery[] }>('/chofer/entregas');
  return data.data;
}

export async function acceptDelivery(deliveryId: string) {
  const { data } = await api.patch<{ data: Delivery }>(
    '/chofer/entregas/' + deliveryId + '/accept',
  );
  return data.data;
}

export async function updateDeliveryState(deliveryId: string, estadoId: 4 | 5 | 7, clienteDni?: string) {
  const { data } = await api.patch<{ data: Delivery }>(
    '/chofer/entregas/' + deliveryId + '/state',
    { estado_id: estadoId, ...(clienteDni ? { cliente_dni: clienteDni } : {}) },
  );
  return data.data;
}
