import { useState } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { useTheme, type MD3Theme } from 'react-native-paper';
import { HelperText } from 'react-native-paper';
import { CTAButton } from '../atoms/CTAButton';
import { TextInputField } from '../atoms/TextInputField';
import { spacing } from '../../styles/theme';
import { isValidEmail } from '../../utils/validation';

type LoginFormProps = {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
  error?: string;
  onForgotPassword?: () => void;
};

export function LoginForm({ onSubmit, loading = false, error, onForgotPassword }: LoginFormProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

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

      <Pressable
        onPress={() => onForgotPassword?.()}
        style={({ pressed }) => [styles.forgotButton, pressed && styles.forgotPressed]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
      >
        <Text style={styles.forgotText}>Olvidé mi contraseña</Text>
      </Pressable>

      <HelperText type="error" visible={Boolean(error)} style={styles.formError}>
        {error}
      </HelperText>

      <CTAButton onPress={handleSubmit} disabled={loading} loading={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </CTAButton>
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: 28,
    },
    forgotButton: {
      alignSelf: 'flex-end',
      paddingVertical: 2,
      marginTop: spacing.xs,
    },
    forgotPressed: {
      opacity: 0.6,
    },
    forgotText: {
      color: theme.colors.primary,
      fontSize: 13,
      fontWeight: '500',
      letterSpacing: 0.2,
      opacity: 0.95,
    },
    formError: {
      paddingHorizontal: 0,
    },
  });
