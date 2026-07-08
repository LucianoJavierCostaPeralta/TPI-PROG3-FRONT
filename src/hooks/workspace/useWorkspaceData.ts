import { useCallback, useState } from 'react';
import { getApiErrorMessage, getProfile, listNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../../services/api';
import {
  emptyWorkspace,
  loadRoleData,
  normalizeRole,
} from '../../utils/dashboard/homeDashboard';
import { type AppNotification, type AppWorkspace } from '../../types/workspace';

const normalizeNotification = (notification: AppNotification): AppNotification => ({
  ...notification,
  tipo: notification.tipo ?? 'info',
  leida: Boolean(notification.leida),
});

export const useWorkspaceData = () => {
  const [workspace, setWorkspace] = useState<AppWorkspace>(emptyWorkspace);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadWorkspace = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const user = await getProfile();
      const role = normalizeRole(user.rol?.nombre_rol);
      const roleData = await loadRoleData(user, role);
      let notifications: AppNotification[] = [];

      try {
        notifications = (await listNotifications()).map(normalizeNotification);
      } catch {
        notifications = [];
      }

      setWorkspace(() => ({
        ...emptyWorkspace,
        ...roleData,
        profile: {
          id: String(user.id),
          empresa_id: user.empresa_id ? String(user.empresa_id) : null,
          nombre: user.nombre_completo,
          email: user.email,
          rol: role,
          telefono: user.telefono,
          activo: user.activo,
        },
        company: user.empresa ? {
          id: String(user.empresa.id),
          nombre: user.empresa.razon_social,
          cuit: null,
          email: null,
          telefono: null,
        } : null,
        notifications,
      }));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo cargar el perfil.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      const updated = await markNotificationAsRead(id);
      setWorkspace((prev) => ({
        ...prev,
        notifications: prev.notifications.map((notification) =>
          notification.id === id ? normalizeNotification(updated) : notification,
        ),
      }));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo marcar la notificación como leída.'));
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const updated = await markAllNotificationsAsRead();
      setWorkspace((prev) => ({
        ...prev,
        notifications: prev.notifications.map((notification) => ({
          ...notification,
          leida: true,
        })),
      }));
      return updated;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudieron marcar todas las notificaciones como leídas.'));
      return 0;
    }
  }, []);

  return {
    error,
    handleMarkAllAsRead,
    handleMarkAsRead,
    loadWorkspace,
    loading,
    refreshing,
    setError,
    setWorkspace,
    unreadCount: workspace.notifications.filter((notification) => !notification.leida).length,
    workspace,
  };
};
