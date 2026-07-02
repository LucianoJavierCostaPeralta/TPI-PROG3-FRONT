import { useState } from 'react';
import { RegisterContent, type RegisterSubmission } from '../components/organisms';
import { RegisterTemplate } from '../components/templates';
import { getApiErrorMessage, register } from '../services/api';

type RegisterScreenProps = {
  navigation?: {
    navigate: (screen: string) => void;
    reset: (state: { index: number; routes: Array<{ name: string }> }) => void;
  };
};

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (data: RegisterSubmission) => {
    setLoading(true);
    setError('');

    if (!data.companyName.trim() || !data.email.trim() || !data.password) {
      setError('Completá los datos requeridos.');
      setLoading(false);
      return;
    }

    try {
      await register({
        razon_social: data.companyName.trim(),
        cuit: data.cuit,
        email: data.email.trim().toLowerCase(),
        password: data.password,
        telefono: data.phone,
        tamano_flota: data.fleetSize,
        terminos_aceptados: data.termsAccepted,
      });
      navigation?.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo crear la cuenta.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterTemplate title="Comience a gestionar su flota">
      <RegisterContent onSubmit={handleRegister} loading={loading} error={error} />
    </RegisterTemplate>
  );
}
