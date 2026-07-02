import { StyleSheet, View } from 'react-native';
import { TextInputField } from '../atoms/TextInputField';
import { onlyDigits } from '../../utils/validation';

export type RegisterData = {
  companyName: string;
  cuit: string;
  email: string;
  password: string;
  phone: string;
};

type RegisterFormErrors = Partial<Record<keyof RegisterData, string>>;

type RegisterFormProps = {
  value: RegisterData;
  errors?: RegisterFormErrors;
  onChange: (data: RegisterData) => void;
  disabled?: boolean;
};

export function RegisterForm({ value, errors = {}, onChange, disabled = false }: RegisterFormProps) {
  const updateField = (field: keyof RegisterData, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <View style={styles.container}>
      <TextInputField
        label="Nombre de la empresa"
        placeholder="Nombre de su empresa"
        value={value.companyName}
        onChangeText={(v) => updateField('companyName', v)}
        disabled={disabled}
        error={errors.companyName}
        icon="office-building-outline"
      />

      <TextInputField
        label="CUIT"
        placeholder="20123456789"
        keyboardType="number-pad"
        value={value.cuit}
        onChangeText={(v) => updateField('cuit', onlyDigits(v, 11))}
        disabled={disabled}
        error={errors.cuit}
        icon="card-account-details-outline"
      />

      <TextInputField
        label="Correo corporativo"
        placeholder="correo@empresa.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={value.email}
        onChangeText={(v) => updateField('email', v.trim())}
        disabled={disabled}
        error={errors.email}
        icon="email-outline"
      />

      <TextInputField
        label="Contraseña"
        placeholder="Mínimo 6 caracteres"
        secureTextEntry
        value={value.password}
        onChangeText={(v) => updateField('password', v)}
        disabled={disabled}
        error={errors.password}
        icon="lock-outline"
      />

      <TextInputField
        label="Teléfono de contacto"
        placeholder="1134567890"
        keyboardType="phone-pad"
        value={value.phone}
        onChangeText={(v) => updateField('phone', onlyDigits(v, 15))}
        disabled={disabled}
        error={errors.phone}
        icon="phone-outline"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
});
