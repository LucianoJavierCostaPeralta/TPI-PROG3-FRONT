import { useCallback } from 'react';
import { Alert } from 'react-native';
import { createDriver, deleteDriver, getApiErrorMessage, updateDriver } from '../../services/api';
import { driverToForm, initialDriverForm } from '../../utils/dashboard/homeDashboard';
import { validateDriverForm } from '../../utils/dashboard/homeDashboardValidation';
import { type AppWorkspace, type Driver, type DriverForm } from '../../types/workspace';

type UseDriverActionsParams = {
  driverForm: DriverForm;
  loadWorkspace: (showRefresh?: boolean) => Promise<void>;
  selectedDriver: Driver | null;
  setDriverForm: React.Dispatch<React.SetStateAction<DriverForm>>;
  setIsEditingDriver: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedDriver: React.Dispatch<React.SetStateAction<Driver | null>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
  setSavingDriver: React.Dispatch<React.SetStateAction<boolean>>;
  setShowDriverForm: React.Dispatch<React.SetStateAction<boolean>>;
  setWorkspace: React.Dispatch<React.SetStateAction<AppWorkspace>>;
};

export const useDriverActions = ({
  driverForm,
  loadWorkspace,
  selectedDriver,
  setDriverForm,
  setError,
  setIsEditingDriver,
  setSelectedDriver,
  setSavingDriver,
  setShowDriverForm,
  setWorkspace,
}: UseDriverActionsParams) => {
  const updateDriverField = useCallback((field: keyof DriverForm, value: string) => {
    setError('');
    setDriverForm((current) => ({ ...current, [field]: value }));
  }, [setDriverForm, setError]);

  const handleCreateDriver = useCallback(async () => {
    const validationError = validateDriverForm(driverForm);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSavingDriver(true);
    setError('');
    try {
      await createDriver({
        nombre_completo: driverForm.nombre.trim(),
        dni: driverForm.documento,
        fecha_nacimiento: driverForm.fechaNacimiento,
        email: driverForm.email.trim().toLowerCase(),
        telefono: driverForm.telefono || undefined,
        password: '123456',
      });
      setDriverForm(initialDriverForm);
      setShowDriverForm(false);
      await loadWorkspace(true);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo crear el chofer.'));
    } finally {
      setSavingDriver(false);
    }
  }, [driverForm, loadWorkspace, setDriverForm, setError, setSavingDriver, setShowDriverForm]);

  const handleEditDriver = useCallback(async () => {
    if (!selectedDriver) return;

    const validationError = validateDriverForm(driverForm);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSavingDriver(true);
    setError('');
    try {
      const updatedDriver = await updateDriver(selectedDriver.id, {
        nombre_completo: driverForm.nombre.trim(),
        dni: driverForm.documento,
        fecha_nacimiento: driverForm.fechaNacimiento,
        email: driverForm.email.trim().toLowerCase(),
        telefono: driverForm.telefono || undefined,
        activo: selectedDriver.activo,
      });

      const updatedMappedDriver: Driver = {
        ...selectedDriver,
        nombre: updatedDriver.nombre_completo,
        email: updatedDriver.email,
        telefono: updatedDriver.telefono,
        documento: updatedDriver.dni,
        fecha_nacimiento: updatedDriver.fecha_nacimiento,
        activo: updatedDriver.activo,
      };

      setWorkspace((current) => ({
        ...current,
        drivers: current.drivers.map((driver) => (driver.id === selectedDriver.id ? updatedMappedDriver : driver)),
      }));
      setSelectedDriver(updatedMappedDriver);
      setIsEditingDriver(false);
      setDriverForm(initialDriverForm);
      await loadWorkspace(true);
      Alert.alert('Éxito', 'El chofer ha sido actualizado correctamente.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo actualizar el chofer.'));
    } finally {
      setSavingDriver(false);
    }
  }, [driverForm, loadWorkspace, selectedDriver, setDriverForm, setError, setIsEditingDriver, setSavingDriver, setSelectedDriver, setWorkspace]);

  const startEditingDriver = useCallback(() => {
    if (!selectedDriver) return;
    setDriverForm(driverToForm(selectedDriver));
    setIsEditingDriver(true);
  }, [selectedDriver, setDriverForm, setIsEditingDriver]);

  const cancelEditingDriver = useCallback(() => {
    setIsEditingDriver(false);
    setDriverForm(initialDriverForm);
  }, [setDriverForm, setIsEditingDriver]);

  const handleDeleteDriver = useCallback(async (driverId: string) => {
    setError('');
    try {
      await deleteDriver(driverId);
      setWorkspace((current) => ({
        ...current,
        drivers: current.drivers.filter((driver) => driver.id !== driverId),
      }));
      Alert.alert('Éxito', 'El chofer ha sido eliminado correctamente.');
    } catch (requestError) {
      Alert.alert('Error', getApiErrorMessage(requestError, 'No se pudo eliminar el chofer.'));
    }
  }, [setError, setWorkspace]);

  return {
    cancelEditingDriver,
    handleCreateDriver,
    handleDeleteDriver,
    handleEditDriver,
    startEditingDriver,
    updateDriverField,
  };
};
