import { useState } from 'react';
import { Alert } from 'react-native';
import { TextInputField } from '../components/atoms/TextInputField';
import { CTAButton } from '../components/atoms/CTAButton';
import { LoginTemplate } from '../components/templates/LoginTemplate';
import { updatePassword } from '../lib/auth';

type ResetPasswordScreenProps = {
  navigation?: {
    reset: (state: { index: number; routes: Array<{ name: string }> }) => void;
  };
};

export function ResetPasswordScreen({ navigation }: ResetPasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updatePassword(password);
      Alert.alert('Contraseña actualizada', 'Ya podés ingresar con tu nueva contraseña.');
      navigation?.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      });
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'No se pudo actualizar la contraseña.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginTemplate
      title="Nueva contraseña"
      subtitle="Ingresá una contraseña nueva para recuperar el acceso"
    >
      <TextInputField
        label="Contraseña nueva"
        placeholder="Mínimo 6 caracteres"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        disabled={loading}
        error={error}
      />
      <TextInputField
        label="Confirmar contraseña"
        placeholder="Repetí la contraseña"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        disabled={loading}
      />
      <CTAButton onPress={handleSubmit} disabled={loading} loading={loading}>
        {loading ? 'Guardando...' : 'Guardar contraseña'}
      </CTAButton>
    </LoginTemplate>
  );
}
