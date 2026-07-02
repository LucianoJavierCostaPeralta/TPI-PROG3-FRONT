import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, AUTH_TOKEN_KEY } from './client';

export type AuthUser = {
  id: number;
  empresa_id: number | null;
  nombre_completo: string;
  email: string;
  telefono: string | null;
  activo: boolean;
  rol?: { id: number; nombre_rol: string };
  empresa?: { id: number; razon_social: string } | null;
};

export type RegisterEmpresaPayload = {
  razon_social: string;
  cuit: string;
  email: string;
  password: string;
  telefono: string;
  tamano_flota: '1-10' | '11-30' | '31-100' | 'Más de 100';
  terminos_aceptados: boolean;
};

async function saveToken(token: string) {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
}

export async function login(email: string, password: string) {
  const { data } = await api.post<{ user: AuthUser; token: string }>('/login', { email, password });
  await saveToken(data.token);
  return data.user;
}

export async function register(payload: RegisterEmpresaPayload) {
  const { data } = await api.post<{ data: { user: AuthUser }; token: string }>('/registro', payload);
  await saveToken(data.token);
  return data.data.user;
}

export async function recoverPassword(email: string) {
  const { data } = await api.post<{ message: string }>('/recuperar-password', { email });
  return data.message;
}

export async function getProfile() {
  const { data } = await api.get<{ user: AuthUser }>('/profile');
  return data.user;
}

export async function hasStoredSession() {
  return Boolean(await AsyncStorage.getItem(AUTH_TOKEN_KEY));
}

export async function logout() {
  try {
    await api.post('/logout');
  } finally {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export async function clearSession() {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}
