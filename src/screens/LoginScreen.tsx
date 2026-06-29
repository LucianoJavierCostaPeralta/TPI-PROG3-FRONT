import { useState } from 'react';
import { Alert } from 'react-native';
import { TextInputField } from '../components/atoms/TextInputField';
import { CTAButton } from '../components/atoms/CTAButton';
import { LoginTemplate } from '../components/templates/LoginTemplate';
import { LoginHeader } from '../components/organisms/LoginHeader';
import { LoginForm } from '../components/molecules/LoginForm';
import { RegisterFooter } from '../components/molecules/RegisterFooter';
import { sendPasswordReset, signInWithEmail } from '../lib/auth';

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }

  return fallback;
}

type LoginScreenProps = {
  navigation?: {
    navigate: (screen: string) => void;
    reset: (state: { index: number; routes: Array<{ name: string }> }) => void;
  };
};

function getAuthErrorMessage(message: string) {
  if (message.toLowerCase().includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.';
  }

  return message;
}

export function LoginScreen({ navigation }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError('');

    try {
      await signInWithEmail(email, password);
      navigation?.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      });
    } catch (authError) {
      const message = getErrorMessage(authError, 'No se pudo iniciar sesión.');
      setError(getAuthErrorMessage(message));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowResetForm((visible) => !visible);
  };

  const handleSendPasswordReset = async () => {
    if (!resetEmail.trim()) {
      setError('Ingresá tu correo para recuperar la contraseña.');
      return;
    }

    setResetLoading(true);
    setError('');

    try {
      await sendPasswordReset(resetEmail);
      setShowResetForm(false);
      setResetEmail('');
      Alert.alert('Correo enviado', 'Revisá tu bandeja para continuar.');
    } catch (resetError) {
      const message = getErrorMessage(resetError, 'No se pudo enviar el correo.');
      setError(message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleConsultWithAdvisor = () => {
    navigation?.navigate('RegisterScreen');
  };

  return (
    <LoginTemplate
      title="Iniciar Sesión"
      subtitle="Ingrese sus credenciales para acceder a la plataforma"
    >
      <LoginHeader onForgotPassword={handleForgotPassword} />
      {showResetForm ? (
        <>
          <TextInputField
            label="Correo de recuperación"
            placeholder="nombre@empresa.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={resetEmail}
            onChangeText={setResetEmail}
            disabled={resetLoading}
          />
          <CTAButton
            onPress={handleSendPasswordReset}
            disabled={resetLoading}
            loading={resetLoading}
            variant="secondary"
          >
            {resetLoading ? 'Enviando...' : 'Enviar enlace'}
          </CTAButton>
        </>
      ) : null}
      <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
      <RegisterFooter onConsultWithAdvisor={handleConsultWithAdvisor} />
    </LoginTemplate>
  );
}
