import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { logout } from '../../services/api';
import { useDashboardNavigation } from './useDashboardNavigation';
import { useDashboardState } from './useDashboardState';
import { useDeliveryActions } from '../deliveries/useDeliveryActions';
import { useDriverActions } from '../drivers/useDriverActions';
import { useOrderStatusActions } from '../deliveries/useOrderStatusActions';
import { useWorkspaceData } from '../workspace/useWorkspaceData';
import { getTabs } from '../../utils/dashboard/homeDashboard';
import { type HomeScreenProps } from '../../types/workspace';

export function useHomeDashboard({ navigation }: HomeScreenProps) {
  const state = useDashboardState();
  const workspaceState = useWorkspaceData();
  const { workspace, loadWorkspace, setError, setWorkspace } = workspaceState;

  const tabs = useMemo(() => getTabs(workspace.profile.rol), [workspace.profile.rol]);

  const driverActions = useDriverActions({
    driverForm: state.driverForm,
    loadWorkspace,
    setDriverForm: state.setDriverForm,
    setError,
    setSavingDriver: state.setSavingDriver,
    setShowDriverForm: state.setShowDriverForm,
    setWorkspace,
  });

  const deliveryActions = useDeliveryActions({
    deliveryForm: state.deliveryForm,
    loadWorkspace,
    selectedDelivery: state.selectedDelivery,
    setAssigningOrderId: state.setAssigningOrderId,
    setDeliveryForm: state.setDeliveryForm,
    setError,
    setIsEditingDelivery: state.setIsEditingDelivery,
    setSavingDelivery: state.setSavingDelivery,
    setSelectedDelivery: state.setSelectedDelivery,
    setShowDeliveryForm: state.setShowDeliveryForm,
    setWorkspace,
    showDeliveryForm: state.showDeliveryForm,
  });

  const statusActions = useOrderStatusActions({
    loadWorkspace,
    setError,
    setSelectedDelivery: state.setSelectedDelivery,
    setUpdatingOrderId: state.setUpdatingOrderId,
    setWorkspace,
    workspace,
  });

  const { headerNav } = useDashboardNavigation({
    activeTab: state.activeTab,
    isEditingDelivery: state.isEditingDelivery,
    loadWorkspace,
    selectedDelivery: state.selectedDelivery,
    selectedDriver: state.selectedDriver,
    setActiveTab: state.setActiveTab,
    setDrawerVisible: state.setDrawerVisible,
    setIsEditingDelivery: state.setIsEditingDelivery,
    setSelectedDelivery: state.setSelectedDelivery,
    setSelectedDriver: state.setSelectedDriver,
    setShowDeliveryForm: state.setShowDeliveryForm,
    setShowDriverForm: state.setShowDriverForm,
    showDeliveryForm: state.showDeliveryForm,
    showDriverForm: state.showDriverForm,
    workspace,
  });

  const handleSignOut = useCallback(() => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } finally {
            navigation?.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
          }
        },
      },
    ]);
  }, [navigation]);

  return {
    ...state,
    ...workspaceState,
    ...deliveryActions,
    ...driverActions,
    ...statusActions,
    handleSignOut,
    headerNav,
    tabs,
  };
}
