import { useState } from 'react';
import { RegisterTemplate } from '../components/templates/RegisterTemplate';
import { RegisterForm, RegisterData } from '../components/molecules/RegisterForm';
import { VehicleSelector } from '../components/organisms/VehicleSelector';
import { BenefitsList } from '../components/organisms/BenefitsList';
import { Checkbox } from '../components/atoms/Checkbox';
import { PrimaryButton } from '../components/atoms/PrimaryButton';

type RegisterScreenProps = {
  navigation?: {
    navigate: (screen: string) => void;
  };
};

type FleetSize = '1-10' | '11-30' | '31-100' | 'Más de 100';

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

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [fleetSize, setFleetSize] = useState<FleetSize>('1-10');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleRegister = (data: RegisterData) => {
    if (!termsAccepted) {
      console.log('Must accept terms');
      return;
    }
    console.log('Register:', { ...data, fleetSize, termsAccepted });
  };

  return (
    <RegisterTemplate title="Comience a gestionar su flota">
      <RegisterForm onSubmit={handleRegister} />
      
      <VehicleSelector value={fleetSize} onChange={setFleetSize} />
      
      <BenefitsList benefits={benefits} />
      
      <Checkbox
        checked={termsAccepted}
        onToggle={() => setTermsAccepted(!termsAccepted)}
        label="He leído y acepto los términos y condiciones y la política de privacidad"
      />
      
      <PrimaryButton onPress={() => handleRegister({ companyName: '', cuit: '', email: '', phone: '' })}>
        Crear cuenta
      </PrimaryButton>
    </RegisterTemplate>
  );
}
