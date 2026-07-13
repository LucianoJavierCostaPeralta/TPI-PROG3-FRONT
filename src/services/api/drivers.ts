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

export type CreateDriverPayload = {
  nombre_completo: string;
  dni: string;
  fecha_nacimiento: string;
  email: string;
  telefono?: string;
  password: string;
};

export type UpdateDriverPayload = Omit<CreateDriverPayload, 'password'> & {
  activo?: boolean;
};

export async function listDrivers() {
  const { data } = await api.get<{ data: Driver[] }>('/admin/choferes');
  return data.data;
}

export async function createDriver(payload: CreateDriverPayload) {
  const { data } = await api.post<{ data: Driver }>('/admin/choferes', payload);
  return data.data;
}

export async function updateDriver(driverId: string, payload: UpdateDriverPayload) {
  const { data } = await api.put<{ data: Driver }>('/admin/choferes/' + driverId, payload);
  return data.data;
}

export async function deleteDriver(driverId: string) {
  const { data } = await api.delete('/admin/choferes/' + driverId);
  return data;
}
