import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import { Platform } from 'react-native';

export const AUTH_TOKEN_KEY = 'zonescore:auth-token';

const developmentHost = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? `http://${developmentHost}:8000/api/v1`
).replace(/\/$/, '');

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type LaravelErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export function getApiErrorMessage(error: unknown, fallback = 'No se pudo completar la operación.') {
  if (!axios.isAxiosError<LaravelErrorResponse>(error)) {
    return fallback;
  }

  const firstValidationError = error.response?.data?.errors
    ? Object.values(error.response.data.errors).flat()[0]
    : undefined;

  if (firstValidationError) return firstValidationError;
  if (error.response?.data?.message && error.response.status !== 500) {
    return error.response.data.message;
  }
  if (error.code === AxiosError.ERR_NETWORK || !error.response) {
    return `No se pudo conectar con el servidor (${API_URL}).`;
  }
  return fallback;
}
