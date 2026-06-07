import { useState } from 'react';
import { Alert } from 'react-native';
import { RegisterContent, type RegisterSubmission } from '../components/organisms';
import { RegisterTemplate } from '../components/templates';
import { sendEmailConfirmation, signUpCompany } from '../lib/auth';

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
      const result = await signUpCompany(data);

      if (result.session) {
        navigation?.reset({
          index: 0,
          routes: [{ name: 'HomeScreen' }],
        });
        return;
      }

      try {
        await sendEmailConfirmation(data.email);
      } catch (confirmationError) {
        console.warn('Could not resend confirmation email', confirmationError);
      }

      Alert.alert(
        'Cuenta creada',
        'Te enviamos el correo de confirmación. Revisá tu bandeja de entrada y spam antes de iniciar sesión.',
        [{ text: 'Aceptar', onPress: () => navigation?.navigate('LoginScreen') }],
      );
    } catch (registerError) {
      const message = registerError instanceof Error ? registerError.message : 'No se pudo crear la cuenta.';
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
