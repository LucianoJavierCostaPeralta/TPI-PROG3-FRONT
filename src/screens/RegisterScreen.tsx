import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { HelperText } from 'react-native-paper';
import { RegisterContent, type RegisterSubmission } from '../components/organisms';
import { RegisterTemplate } from '../components/templates';
import { CTAButton } from '../components/atoms/CTAButton';
import { TextInputField } from '../components/atoms/TextInputField';
import { confirmSignUpCode, sendEmailConfirmation, signUpCompany } from '../lib/auth';

type RegisterScreenProps = {
  navigation?: {
    navigate: (screen: string) => void;
    reset: (state: { index: number; routes: Array<{ name: string }> }) => void;
  };
};

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationPhase, setConfirmationPhase] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');

  const handleRegister = async (data: RegisterSubmission) => {
    setLoading(true);
    setError('');
    setConfirmationCode('');
    setConfirmationMessage('');

    try {
      const result = await signUpCompany(data);
      console.log('RegisterScreen signUp result:', result);

      if (result.session) {
        navigation?.reset({
          index: 0,
          routes: [{ name: 'HomeScreen' }],
        });
        return;
      }

      const exactEmail = data.email.trim();
      setPendingEmail(exactEmail);
      setConfirmationPhase(true);

      try {
        await sendEmailConfirmation(exactEmail);
        setConfirmationMessage('Se envió un nuevo código de confirmación a tu correo. Revisá bandeja de entrada y spam.');
      } catch (confirmationError) {
        console.warn('Could not resend confirmation email', confirmationError);
        setError('No se pudo enviar el código de confirmación. Intentá nuevamente.');
      }
    } catch (registerError) {
      console.log('RegisterScreen signUp error:', registerError);
      const message = registerError instanceof Error ? registerError.message : 'No se pudo crear la cuenta.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!confirmationCode.trim()) {
      setError('Ingresá el código de confirmación.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await confirmSignUpCode(pendingEmail, confirmationCode);

      Alert.alert(
        'Cuenta confirmada ✅',
        'Tu cuenta ha sido confirmada. Iniciá sesión para continuar.',
        [{ text: 'Ir al login', onPress: () => navigation?.navigate('LoginScreen') }],
      );
    } catch (confirmError) {
      const message =
        confirmError instanceof Error
          ? /invalid|expired|código/i.test(confirmError.message)
            ? 'Código inválido ❌'
            : confirmError.message
          : 'Código inválido ❌';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterTemplate title="Comience a gestionar su flota">
      {confirmationPhase ? (
        <View style={styles.container}>
          <TextInputField
            label="Código de confirmación"
            placeholder="Pegá el código aquí"
            value={confirmationCode}
            onChangeText={setConfirmationCode}
            disabled={loading}
            icon="email-check-outline"
          />
          <TextInputField
            label="Correo utilizado"
            value={pendingEmail}
            disabled
            icon="email-outline"
          />

          <HelperText type="info" visible={Boolean(confirmationMessage)} style={styles.helperText}>
            {confirmationMessage}
          </HelperText>
          <HelperText type="info" visible={!confirmationMessage && !error} style={styles.helperText}>
            Revisá tu correo y pegá el código de confirmación aquí.
          </HelperText>
          <HelperText type="error" visible={Boolean(error)} style={styles.helperText}>
            {error}
          </HelperText>

          <CTAButton onPress={handleConfirmCode} disabled={loading} loading={loading}>
            {loading ? 'Verificando código...' : 'Confirmar cuenta'}
          </CTAButton>
        </View>
      ) : (
        <RegisterContent onSubmit={handleRegister} loading={loading} error={error} />
      )}
    </RegisterTemplate>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  helperText: {
    paddingHorizontal: 0,
  },
});
