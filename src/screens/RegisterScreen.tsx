import { useState } from 'react';
import { RegisterContent, type RegisterSubmission } from '../components/organisms';
import { RegisterTemplate } from '../components/templates';
import { signUpCompany } from '../lib/auth';

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }

  return fallback;
}

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

    try {
      await signUpCompany(data);
      navigation?.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      });
    } catch (registerError) {
      const message = getErrorMessage(registerError, 'No se pudo crear la cuenta.');
      setError(message);
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
