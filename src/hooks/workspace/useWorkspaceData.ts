import { useCallback, useState } from 'react';
import { getApiErrorMessage, getProfile } from '../../services/api';
import {
  emptyWorkspace,
  initialAdminNotifications,
  initialChoferNotifications,
  loadRoleData,
  normalizeRole,
} from '../../utils/dashboard/homeDashboard';
import { type AppWorkspace } from '../../types/workspace';

export function useWorkspaceData() {
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

      setWorkspace((prev) => ({
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
        notifications: prev.notifications.length > 0 && prev.profile.rol === role
          ? prev.notifications
          : (role === 'chofer' ? initialChoferNotifications : initialAdminNotifications),
      }));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo cargar el perfil.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleMarkAsRead = useCallback((id: string) => {
    setWorkspace((prev) => ({
      ...prev,
      notifications: prev.notifications.map((notification) =>
        notification.id === id ? { ...notification, leida: true } : notification,
      ),
    }));
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setWorkspace((prev) => ({
      ...prev,
      notifications: prev.notifications.map((notification) => ({ ...notification, leida: true })),
    }));
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
}
