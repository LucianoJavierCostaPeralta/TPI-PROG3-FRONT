import { useState } from 'react';
import { Alert } from 'react-native';
import { TextInputField } from '../components/atoms/TextInputField';
import { CTAButton } from '../components/atoms/CTAButton';
import { LoginTemplate } from '../components/templates/LoginTemplate';
import { LoginHeader } from '../components/organisms/LoginHeader';
import { LoginForm } from '../components/molecules/LoginForm';
import { RegisterFooter } from '../components/molecules/RegisterFooter';
import { getApiErrorMessage, login, recoverPassword } from '../services/api';

type LoginScreenProps = {
  navigation?: {
    navigate: (screen: string) => void;
    reset: (state: { index: number; routes: Array<{ name: string }> }) => void;
  };
};

export function LoginScreen({ navigation }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError('');

    if (!email.trim() || !password) {
      setError('Ingresá correo y contraseña.');
      setLoading(false);
      return;
    }

    try {
      await login(email.trim().toLowerCase(), password);
      navigation?.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo iniciar sesión.'));
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
      const message = await recoverPassword(resetEmail.trim().toLowerCase());
      setShowResetForm(false);
      setResetEmail('');
      Alert.alert('Recuperación de contraseña', message);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo recuperar la contraseña.'));
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
