import { useState } from 'react';
import { RegisterContent, type RegisterSubmission } from '../components/organisms';
import { RegisterTemplate } from '../components/templates';

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

    navigation?.reset({
      index: 0,
      routes: [{ name: 'HomeScreen' }],
    });
    setLoading(false);
  };

  return (
    <RegisterTemplate title="Comience a gestionar su flota">
      <RegisterContent onSubmit={handleRegister} loading={loading} error={error} />
    </RegisterTemplate>
  );
}
