import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PrimaryButton } from '../atoms/PrimaryButton';
import { TextInputField } from '../atoms/TextInputField';

type LoginFormProps = {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
};

export function LoginForm({ onSubmit, loading = false }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleSubmit = () => {
    if (!email) {
      setEmailError('El correo es requerido');
      return;
    }
    setEmailError('');
    onSubmit(email, password);
  };

  return (
    <View style={styles.container}>
      <TextInputField
        label="Correo electrónico"
        placeholder="nombre@empresa.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        error={emailError}
      />

      <TextInputField
        label="Contraseña"
        placeholder="••••••••"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <PrimaryButton
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Ingresando...' : 'Ingresar'}
      </PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
});
