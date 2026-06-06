import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
};

const initialRegisterData: RegisterData = {
  companyName: '',
  cuit: '',
  email: '',
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

export function RegisterContent({ onSubmit }: RegisterContentProps) {
  const [formData, setFormData] = useState<RegisterData>(initialRegisterData);
  const [fleetSize, setFleetSize] = useState<FleetSize>('1-10');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSubmit = () => {
    onSubmit({ ...formData, fleetSize, termsAccepted });
  };

  return (
    <View style={styles.container}>
      <RegisterForm value={formData} onChange={setFormData} />

      <VehicleSelector value={fleetSize} onChange={setFleetSize} />

      <BenefitsList benefits={benefits} />

      <Checkbox
        checked={termsAccepted}
        onToggle={setTermsAccepted}
        label="He leído y acepto los términos y condiciones y la política de privacidad"
      />

      <CTAButton onPress={handleSubmit} disabled={!termsAccepted}>
        Crear cuenta
      </CTAButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
});
