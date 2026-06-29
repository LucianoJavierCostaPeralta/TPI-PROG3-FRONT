import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { HelperText } from 'react-native-paper';
import { z } from 'zod';
import { CTAButton } from '../atoms/CTAButton';
import { Checkbox } from '../atoms/Checkbox';
import {
  RegisterForm,
  type RegisterData,
  VehicleSelector,
  type FleetSize,
} from '../molecules';
import { BenefitsList } from './BenefitsList';

const fleetSizes = ['1-10', '11-30', '31-100', 'Más de 100'] as const;

const registerSchema = z.object({
  companyName: z.string().trim().min(1, 'Ingresá el nombre de la empresa.'),
  cuit: z
    .string()
    .regex(/^\d+$/, 'El CUIT solo puede tener números.')
    .length(11, 'El CUIT debe tener exactamente 11 números.'),
  email: z
    .string()
    .trim()
    .email('Ingresá un correo válido, por ejemplo nombre@empresa.com.')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'El correo debe incluir dominio, por ejemplo nombre@empresa.com.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
  phone: z
    .string()
    .regex(/^\d+$/, 'El teléfono solo puede tener números.')
    .min(8, 'El teléfono debe tener al menos 8 números.')
    .max(15, 'El teléfono no puede superar 15 números.'),
  fleetSize: z.enum(fleetSizes),
  termsAccepted: z.boolean().refine((accepted) => accepted, 'Debés aceptar los términos y condiciones.'),
});

export type RegisterSubmission = z.infer<typeof registerSchema>;

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
    icon: 'chart-line',
    title: 'Monitoreo en tiempo real',
    description: 'Visualice el estado de sus entregas y conductores desde un único panel.',
  },
  {
    icon: 'lightning-bolt',
    title: 'Mayor eficiencia operativa',
    description: 'Optimice rutas, tiempos de entrega y asignación de vehículos.',
  },
  {
    icon: 'chart-scatter-plot',
    title: 'Información para tomar decisiones',
    description: 'Acceda a métricas y reportes para mejorar el rendimiento de su flota.',
  },
] as const;

export function RegisterContent({ onSubmit, loading = false, error }: RegisterContentProps) {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterSubmission>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      ...initialRegisterData,
      fleetSize: '1-10',
      termsAccepted: false,
    },
    mode: 'onSubmit',
  });

  const formData = watch();
  const registerData: RegisterData = {
    companyName: formData.companyName,
    cuit: formData.cuit,
    email: formData.email,
    password: formData.password,
    phone: formData.phone,
  };

  const updateRegisterData = (data: RegisterData) => {
    setValue('companyName', data.companyName, { shouldValidate: Boolean(errors.companyName) });
    setValue('cuit', data.cuit, { shouldValidate: Boolean(errors.cuit) });
    setValue('email', data.email, { shouldValidate: Boolean(errors.email) });
    setValue('password', data.password, { shouldValidate: Boolean(errors.password) });
    setValue('phone', data.phone, { shouldValidate: Boolean(errors.phone) });
  };

  const handleFleetSizeChange = (fleetSize: FleetSize) => {
    setValue('fleetSize', fleetSize, { shouldValidate: Boolean(errors.fleetSize) });
  };

  const handleTermsChange = (termsAccepted: boolean) => {
    setValue('termsAccepted', termsAccepted, { shouldValidate: true });
  };

  const visibleError = error || errors.termsAccepted?.message;

  return (
    <View style={styles.container}>
      <RegisterForm
        value={registerData}
        errors={{
          companyName: errors.companyName?.message,
          cuit: errors.cuit?.message,
          email: errors.email?.message,
          password: errors.password?.message,
          phone: errors.phone?.message,
        }}
        onChange={updateRegisterData}
        disabled={loading}
      />

      <VehicleSelector value={formData.fleetSize} onChange={handleFleetSizeChange} />

      <BenefitsList benefits={benefits} />

      <Checkbox
        checked={formData.termsAccepted}
        onToggle={handleTermsChange}
        label="He leído y acepto los términos y condiciones y la política de privacidad"
        disabled={loading}
      />

      <HelperText type="error" visible={Boolean(visibleError)} style={styles.error}>
        {visibleError}
      </HelperText>

      <CTAButton onPress={handleSubmit(onSubmit)} disabled={loading} loading={loading}>
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
