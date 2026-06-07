import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HelperText } from 'react-native-paper';
import { CTAButton } from '../atoms/CTAButton';
import { Checkbox } from '../atoms/Checkbox';
import {
  RegisterForm,
  type RegisterData,
  VehicleSelector,
  type FleetSize,
} from '../molecules';
import { BenefitsList } from './BenefitsList';

export type RegisterSubmission = RegisterData & {
  fleetSize: FleetSize;
  termsAccepted: boolean;
};

type RegisterContentProps = {
  onSubmit: (data: RegisterSubmission) => void;
  loading?: boolean;
  error?: string;
};

const initialRegisterData: RegisterData = {
  companyName: '',
  cuit: '',
  email: '',
  password: '',
  phone: '',
};

const benefits = [
  {
    icon: '📡',
    title: 'Monitoreo en tiempo real',
    description: 'Seguimiento GPS instantáneo',
  },
  {
    icon: '⚡',
    title: 'Mayor eficiencia operativa',
    description: 'Optimización automática de rutas',
  },
  {
    icon: '📊',
    title: 'Información para tomar decisiones',
    description: 'Reportes detallados y análisis',
  },
];

export function RegisterContent({ onSubmit, loading = false, error }: RegisterContentProps) {
  const [formData, setFormData] = useState<RegisterData>(initialRegisterData);
  const [fleetSize, setFleetSize] = useState<FleetSize>('1-10');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = () => {
    if (!formData.companyName.trim() || !formData.email.trim() || !formData.password) {
      setValidationError('Completá empresa, correo y contraseña para continuar.');
      return;
    }

    if (formData.password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (!termsAccepted) {
      setValidationError('Debés aceptar los términos y condiciones.');
      return;
    }

    setValidationError('');
    onSubmit({ ...formData, fleetSize, termsAccepted });
  };

  const visibleError = validationError || error;

  return (
    <View style={styles.container}>
      <RegisterForm value={formData} onChange={setFormData} disabled={loading} />

      <VehicleSelector value={fleetSize} onChange={setFleetSize} />

      <BenefitsList benefits={benefits} />

      <Checkbox
        checked={termsAccepted}
        onToggle={setTermsAccepted}
        label="He leído y acepto los términos y condiciones y la política de privacidad"
        disabled={loading}
      />

      <HelperText type="error" visible={Boolean(visibleError)} style={styles.error}>
        {visibleError}
      </HelperText>

      <CTAButton onPress={handleSubmit} disabled={loading || !termsAccepted} loading={loading}>
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </CTAButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  error: {
    paddingHorizontal: 0,
  },
});
