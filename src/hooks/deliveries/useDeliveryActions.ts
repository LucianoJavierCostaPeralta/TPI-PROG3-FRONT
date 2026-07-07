import { useCallback } from 'react';
import { Alert } from 'react-native';
import { assignDriver, createDelivery, getApiErrorMessage } from '../../services/api';
import { deliveryToForm, initialDeliveryForm } from '../../utils/dashboard/homeDashboard';
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

export function useDeliveryActions({
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
}: UseDeliveryActionsParams) {
  const updateDeliveryField = useCallback((field: keyof DeliveryForm, value: string) => {
    setDeliveryForm((current) => ({ ...current, [field]: value }));
  }, [setDeliveryForm]);

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
        referencia: deliveryForm.referencia.trim() || deliveryForm.observaciones.trim() || undefined,
      });
      if (deliveryForm.choferId) {
        await assignDriver(newDelivery.id, deliveryForm.choferId);
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
      if (deliveryForm.choferId !== selectedDelivery.chofer_id) {
        await assignDriver(selectedDelivery.id, deliveryForm.choferId || null);
      }

      const updatedOrder: DeliveryOrder = {
        ...selectedDelivery,
        cliente: deliveryForm.cliente.trim(),
        cliente_dni: deliveryForm.clienteDni,
        direccion_destino: deliveryForm.destino.trim(),
        referencia: deliveryForm.referencia.trim(),
        producto: deliveryForm.productos.trim(),
        observaciones: deliveryForm.observaciones.trim(),
        chofer_id: deliveryForm.choferId || null,
        created_at: deliveryForm.fecha ? `${deliveryForm.fecha}T12:00:00.000000Z` : selectedDelivery.created_at,
      };

      setWorkspace((current) => ({
        ...current,
        orders: current.orders.map((order) => (order.id === selectedDelivery.id ? updatedOrder : order)),
      }));
      setSelectedDelivery(updatedOrder);
      setIsEditingDelivery(false);
      setDeliveryForm(initialDeliveryForm);
      await loadWorkspace(true);
      Alert.alert('Éxito', 'La entrega ha sido guardada correctamente.');
    } catch {
      setError('No se pudo guardar la edición.');
    } finally {
      setSavingDelivery(false);
    }
  }, [deliveryForm, loadWorkspace, selectedDelivery, setDeliveryForm, setError, setIsEditingDelivery, setSavingDelivery, setSelectedDelivery, setWorkspace]);

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
    startEditingDelivery,
    toggleDeliveryForm,
    updateDeliveryField,
  };
}
