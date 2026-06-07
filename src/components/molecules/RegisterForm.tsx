import { StyleSheet, View } from 'react-native';
import { TextInputField } from '../atoms/TextInputField';

export type RegisterData = {
  companyName: string;
  cuit: string;
  email: string;
  password: string;
  phone: string;
};

type RegisterFormProps = {
  value: RegisterData;
  onChange: (data: RegisterData) => void;
  disabled?: boolean;
};

export function RegisterForm({ value, onChange, disabled = false }: RegisterFormProps) {
  const updateField = (field: keyof RegisterData, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <View style={styles.container}>
      <TextInputField
        label="Nombre de la empresa"
        placeholder="Nombre de su empresa"
        value={value.companyName}
        onChangeText={(fieldValue) => updateField('companyName', fieldValue)}
        disabled={disabled}
      />

      <TextInputField
        label="CUIT"
        placeholder="20-12345678-9"
        keyboardType="number-pad"
        value={value.cuit}
        onChangeText={(fieldValue) => updateField('cuit', fieldValue)}
        disabled={disabled}
      />

      <TextInputField
        label="Correo corporativo"
        placeholder="correo@empresa.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={value.email}
        onChangeText={(fieldValue) => updateField('email', fieldValue)}
        disabled={disabled}
      />

      <TextInputField
        label="Contraseña"
        placeholder="Mínimo 6 caracteres"
        secureTextEntry
        value={value.password}
        onChangeText={(fieldValue) => updateField('password', fieldValue)}
        disabled={disabled}
      />

      <TextInputField
        label="Teléfono de contacto"
        placeholder="(011) 1234-5678"
        keyboardType="phone-pad"
        value={value.phone}
        onChangeText={(fieldValue) => updateField('phone', fieldValue)}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
});
