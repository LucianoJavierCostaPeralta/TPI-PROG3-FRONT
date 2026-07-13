import { useCallback } from 'react';
import { Alert } from 'react-native';
import { assignDriver, createDelivery, deleteDelivery, getApiErrorMessage, updateDelivery } from '../../services/api';
import { deliveryToForm, initialDeliveryForm, mapDelivery } from '../../utils/dashboard/homeDashboard';
import { validateDeliveryForm } from '../../utils/dashboard/homeDashboardValidation';
import { type AppWorkspace, type DeliveryForm, type DeliveryOrder } from '../../types/workspace';

type UseDeliveryActionsParams = {
  deliveryForm: DeliveryForm;
  loadWorkspace: (showRefresh?: boolean) => Promise<void>;
  selectedDelivery: DeliveryOrder | null;
  setAssigningOrderId: React.Dispatch<React.SetStateAction<string | null>>;
  setDeliveryForm: React.Dispatch<React.SetStateAction<DeliveryForm>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
  setIsEditingDelivery: React.Dispatch<React.SetStateAction<boolean>>;
  setSavingDelivery: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedDelivery: React.Dispatch<React.SetStateAction<DeliveryOrder | null>>;
  setShowDeliveryForm: React.Dispatch<React.SetStateAction<boolean>>;
  setWorkspace: React.Dispatch<React.SetStateAction<AppWorkspace>>;
  showDeliveryForm: boolean;
};

export const useDeliveryActions = ({
  deliveryForm,
  loadWorkspace,
  selectedDelivery,
  setAssigningOrderId,
  setDeliveryForm,
  setError,
  setIsEditingDelivery,
  setSavingDelivery,
  setSelectedDelivery,
  setShowDeliveryForm,
  setWorkspace,
  showDeliveryForm,
}: UseDeliveryActionsParams) => {
  const updateDeliveryField = useCallback((field: keyof DeliveryForm, value: string) => {
    setError('');
    setDeliveryForm((current) => ({ ...current, [field]: value }));
  }, [setDeliveryForm, setError]);

  const handleCreateDelivery = useCallback(async () => {
    const validationError = validateDeliveryForm(deliveryForm, true);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSavingDelivery(true);
    setError('');

    try {
      const newDelivery = await createDelivery({
        cliente: deliveryForm.cliente.trim(),
        cliente_dni: deliveryForm.clienteDni,
        producto: deliveryForm.productos.trim(),
        direccion_destino: deliveryForm.destino.trim(),
        fecha: deliveryForm.fecha.slice(0, 10),
        referencia: deliveryForm.referencia.trim() || deliveryForm.observaciones.trim() || undefined,
      });

      if (deliveryForm.choferId) {
        try {
          await assignDriver(newDelivery.id, deliveryForm.choferId);
        } catch (assignError) {
          setDeliveryForm(initialDeliveryForm);
          setShowDeliveryForm(false);
          await loadWorkspace(true);
          setError(getApiErrorMessage(assignError, 'La entrega fue creada, pero no se pudo asignar el chofer.'));
          return;
        }
      }

      setDeliveryForm(initialDeliveryForm);
      setShowDeliveryForm(false);
      await loadWorkspace(true);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo crear la entrega.'));
    } finally {
      setSavingDelivery(false);
    }
  }, [deliveryForm, loadWorkspace, setDeliveryForm, setError, setSavingDelivery, setShowDeliveryForm]);

  const handleAssignDriver = useCallback(async (orderId: string, driverId: string | null) => {
    setAssigningOrderId(orderId);
    setError('');

    try {
      await assignDriver(orderId, driverId);
      setSelectedDelivery((current) => (current?.id === orderId ? { ...current, chofer_id: driverId } : current));
      await loadWorkspace(true);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo asignar el chofer.'));
    } finally {
      setAssigningOrderId(null);
    }
  }, [loadWorkspace, setAssigningOrderId, setError, setSelectedDelivery]);

  const handleEditDelivery = useCallback(async () => {
    if (!selectedDelivery) return;

    const validationError = validateDeliveryForm(deliveryForm, false);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSavingDelivery(true);
    setError('');

    try {
      let updatedOrder: DeliveryOrder = mapDelivery(await updateDelivery(selectedDelivery.id, {
        cliente: deliveryForm.cliente.trim(),
        cliente_dni: deliveryForm.clienteDni,
        producto: deliveryForm.productos.trim(),
        direccion_destino: deliveryForm.destino.trim(),
        referencia: deliveryForm.referencia.trim() || null,
      }));

      if (deliveryForm.choferId !== selectedDelivery.chofer_id) {
        updatedOrder = mapDelivery(await assignDriver(selectedDelivery.id, deliveryForm.choferId || null));
      }

      setWorkspace((current) => ({
        ...current,
        orders: current.orders.map((order) => (order.id === selectedDelivery.id ? updatedOrder : order)),
      }));
      setSelectedDelivery(updatedOrder);
      setIsEditingDelivery(false);
      setDeliveryForm(initialDeliveryForm);
      await loadWorkspace(true);
      Alert.alert('Éxito', 'La entrega ha sido guardada correctamente.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo guardar la edición.'));
    } finally {
      setSavingDelivery(false);
    }
  }, [deliveryForm, loadWorkspace, selectedDelivery, setDeliveryForm, setError, setIsEditingDelivery, setSavingDelivery, setSelectedDelivery, setWorkspace]);

  const handleDeleteDelivery = useCallback(async (deliveryId: string) => {
    setSavingDelivery(true);
    setError('');

    try {
      await deleteDelivery(deliveryId);
      setWorkspace((current) => ({
        ...current,
        orders: current.orders.filter((order) => order.id !== deliveryId),
      }));
      setSelectedDelivery((current) => (current?.id === deliveryId ? null : current));
      await loadWorkspace(true);
      Alert.alert('Éxito', 'La entrega ha sido eliminada correctamente.');
    } catch (requestError) {
      Alert.alert('Error', getApiErrorMessage(requestError, 'No se pudo eliminar la entrega.'));
    } finally {
      setSavingDelivery(false);
    }
  }, [loadWorkspace, setError, setSavingDelivery, setSelectedDelivery, setWorkspace]);

  const startEditingDelivery = useCallback(() => {
    if (!selectedDelivery) return;
    setDeliveryForm(deliveryToForm(selectedDelivery));
    setIsEditingDelivery(true);
  }, [selectedDelivery, setDeliveryForm, setIsEditingDelivery]);

  const cancelEditingDelivery = useCallback(() => {
    setIsEditingDelivery(false);
    setDeliveryForm(initialDeliveryForm);
  }, [setDeliveryForm, setIsEditingDelivery]);

  const cancelDeliveryForm = useCallback(() => {
    setShowDeliveryForm(false);
    setDeliveryForm(initialDeliveryForm);
  }, [setDeliveryForm, setShowDeliveryForm]);

  const toggleDeliveryForm = useCallback(() => {
    if (!showDeliveryForm) {
      setDeliveryForm(initialDeliveryForm);
    }
    setShowDeliveryForm((visible) => !visible);
  }, [setDeliveryForm, setShowDeliveryForm, showDeliveryForm]);

  return {
    cancelDeliveryForm,
    cancelEditingDelivery,
    handleAssignDriver,
    handleCreateDelivery,
    handleEditDelivery,
    handleDeleteDelivery,
    startEditingDelivery,
    toggleDeliveryForm,
    updateDeliveryField,
  };
};
