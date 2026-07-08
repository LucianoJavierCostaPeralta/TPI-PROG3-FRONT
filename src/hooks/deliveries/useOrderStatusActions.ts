import { useCallback } from 'react';
import { Alert } from 'react-native';
import { acceptDelivery, getApiErrorMessage, updateDeliveryState } from '../../services/api';
import { mapDelivery, markOrderAsCancelled } from '../../utils/dashboard/homeDashboard';
import { type AppWorkspace, type DeliveryOrder, ORDER_STATUS } from '../../types/workspace';

type UseOrderStatusActionsParams = {
  loadWorkspace: (showRefresh?: boolean) => Promise<void>;
  setError: React.Dispatch<React.SetStateAction<string>>;
  setSelectedDelivery: React.Dispatch<React.SetStateAction<DeliveryOrder | null>>;
  setUpdatingOrderId: React.Dispatch<React.SetStateAction<string | null>>;
  setWorkspace: React.Dispatch<React.SetStateAction<AppWorkspace>>;
  workspace: AppWorkspace;
};

export const useOrderStatusActions = ({
  loadWorkspace,
  setError,
  setSelectedDelivery,
  setUpdatingOrderId,
  setWorkspace,
  workspace,
}: UseOrderStatusActionsParams) => {
  const handleUpdateOrderStatus = useCallback(async (orderId: string, action: string, clienteDni?: string) => {
    if (workspace.profile.rol === 'chofer' && (action === 'accept' || action === 'on_the_way')) {
      const activeOrder = workspace.orders.find(
        (order) =>
          (order.estado_id === ORDER_STATUS.ACCEPTED || order.estado_id === ORDER_STATUS.ON_THE_WAY) &&
          String(order.id) !== String(orderId),
      );
      if (activeOrder) {
        Alert.alert(
          'Pedido en curso',
          'Ya tienes un pedido activo. Debes completar o cancelar tu pedido actual antes de iniciar otro.',
        );
        return;
      }
    }

    setUpdatingOrderId(orderId);
    setError('');

    try {
      let updatedOrder: DeliveryOrder | null = null;

      if (action === 'accept') {
        updatedOrder = mapDelivery(await acceptDelivery(orderId));
      }
      if (action === 'on_the_way') {
        updatedOrder = mapDelivery(await updateDeliveryState(orderId, ORDER_STATUS.ON_THE_WAY));
      }
      if (action === 'delivered') {
        updatedOrder = mapDelivery(await updateDeliveryState(orderId, ORDER_STATUS.DELIVERED, clienteDni));
      }
      if (action === 'cancelled') {
        await markOrderAsCancelled(orderId);
        const found = workspace.orders.find((order) => order.id === orderId);
        if (found) {
          updatedOrder = { ...found, estado_id: ORDER_STATUS.CANCELLED, estado: 'cancelled' };
        }
      }

      if (updatedOrder) {
        setSelectedDelivery(updatedOrder);
      }
      await loadWorkspace(true);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo actualizar el estado.'));
    } finally {
      setUpdatingOrderId(null);
    }
  }, [loadWorkspace, setError, setSelectedDelivery, setUpdatingOrderId, setWorkspace, workspace.orders, workspace.profile]);

  return { handleUpdateOrderStatus };
};
