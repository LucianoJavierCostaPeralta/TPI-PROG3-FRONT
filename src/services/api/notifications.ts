import { api } from './client';
import { type AppNotification } from '../../types/workspace';

export async function listNotifications() {
  const { data } = await api.get<{ data: AppNotification[] }>('/notificaciones');
  return data.data;
}

export async function markNotificationAsRead(notificationId: string) {
  const { data } = await api.patch<{ data: AppNotification }>(`/notificaciones/${notificationId}/read`);
  return data.data;
}

export async function markAllNotificationsAsRead() {
  const { data } = await api.patch<{ data: { updated: number } }>('/notificaciones/read-all');
  return data.data.updated;
}
