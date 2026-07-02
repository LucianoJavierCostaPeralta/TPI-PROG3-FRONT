import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HelperText } from 'react-native-paper';
import { CTAButton } from '../atoms/CTAButton';
import { TextInputField } from '../atoms/TextInputField';
import { isValidEmail } from '../../utils/validation';

type LoginFormProps = {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
  error?: string;
};

export function LoginForm({ onSubmit, loading = false, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = () => {
    const missingEmail = !email.trim();
    const missingPassword = !password;
    const invalidEmail = !missingEmail && !isValidEmail(email);

    setEmailError(
      missingEmail
        ? 'El correo es requerido'
        : invalidEmail
          ? 'Ingresá un correo válido, por ejemplo example@example.com'
          : '',
    );
    setPasswordError(missingPassword ? 'La contraseña es requerida' : '');

    if (missingEmail || invalidEmail || missingPassword) {
      return;
    }

    onSubmit(email, password);
  };

  return (
    <View style={styles.container}>
      <TextInputField
        label="Correo electrónico"
        placeholder="nombre@empresa.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
        error={emailError}
        disabled={loading}
        icon="email-outline"   // nuevo
      />

      <TextInputField
        label="Contraseña"
        placeholder="••••••••"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        error={passwordError}
        disabled={loading}
          icon="lock-outline"    // nuevo
      />

      <HelperText type="error" visible={Boolean(error)} style={styles.formError}>
        {error}
      </HelperText>

      <CTAButton onPress={handleSubmit} disabled={loading} loading={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </CTAButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  formError: {
    paddingHorizontal: 0,
  },
});
