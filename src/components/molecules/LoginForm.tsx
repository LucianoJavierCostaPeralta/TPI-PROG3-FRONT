import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CTAButton } from '../atoms/CTAButton';
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

      <CTAButton onPress={handleSubmit} disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </CTAButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
});
