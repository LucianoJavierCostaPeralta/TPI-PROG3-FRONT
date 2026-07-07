import { useCallback } from 'react';
import { Alert } from 'react-native';
import { createDriver, deleteDriver, getApiErrorMessage } from '../../services/api';
import { initialDriverForm } from '../../utils/dashboard/homeDashboard';
import { validateDriverForm } from '../../utils/dashboard/homeDashboardValidation';
import { type AppWorkspace, type DriverForm } from '../../types/workspace';

type UseDriverActionsParams = {
  driverForm: DriverForm;
  loadWorkspace: (showRefresh?: boolean) => Promise<void>;
  setDriverForm: React.Dispatch<React.SetStateAction<DriverForm>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
  setSavingDriver: React.Dispatch<React.SetStateAction<boolean>>;
  setShowDriverForm: React.Dispatch<React.SetStateAction<boolean>>;
  setWorkspace: React.Dispatch<React.SetStateAction<AppWorkspace>>;
};

export const useDriverActions = ({
  driverForm,
  loadWorkspace,
  setDriverForm,
  setError,
  setSavingDriver,
  setShowDriverForm,
  setWorkspace,
}: UseDriverActionsParams) => {
  const updateDriverField = useCallback((field: keyof DriverForm, value: string) => {
    setDriverForm((current) => ({ ...current, [field]: value }));
  }, [setDriverForm]);

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
    handleCreateDriver,
    handleDeleteDriver,
    updateDriverField,
  };
};
