import { StyleSheet, View } from 'react-native';
import { TextInputField } from '../atoms/TextInputField';

export type RegisterData = {
  companyName: string;
  cuit: string;
  email: string;
  phone: string;
};

type RegisterFormProps = {
  value: RegisterData;
  onChange: (data: RegisterData) => void;
};

export function RegisterForm({ value, onChange }: RegisterFormProps) {
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
      />

      <TextInputField
        label="CUIT"
        placeholder="20-12345678-9"
        keyboardType="number-pad"
        value={value.cuit}
        onChangeText={(fieldValue) => updateField('cuit', fieldValue)}
      />

      <TextInputField
        label="Correo corporativo"
        placeholder="correo@empresa.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={value.email}
        onChangeText={(fieldValue) => updateField('email', fieldValue)}
      />

      <TextInputField
        label="Teléfono de contacto"
        placeholder="(011) 1234-5678"
        keyboardType="phone-pad"
        value={value.phone}
        onChangeText={(fieldValue) => updateField('phone', fieldValue)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
});
