import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PrimaryButton } from '../atoms/PrimaryButton';
import { TextInputField } from '../atoms/TextInputField';

type RegisterFormProps = {
  onSubmit: (data: RegisterData) => void;
  loading?: boolean;
};

export type RegisterData = {
  companyName: string;
  cuit: string;
  email: string;
  phone: string;
};

export function RegisterForm({ onSubmit, loading = false }: RegisterFormProps) {
  const [companyName, setCompanyName] = useState('');
  const [cuit, setCuit] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = () => {
    onSubmit({ companyName, cuit, email, phone });
  };

  return (
    <View style={styles.container}>
      <TextInputField
        label="Nombre de la empresa"
        placeholder="Nombre de su empresa"
        value={companyName}
        onChangeText={setCompanyName}
      />

      <TextInputField
        label="CUIT"
        placeholder="20-12345678-9"
        keyboardType="number-pad"
        value={cuit}
        onChangeText={setCuit}
      />

      <TextInputField
        label="Correo corporativo"
        placeholder="correo@empresa.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInputField
        label="Teléfono de contacto"
        placeholder="(011) 1234-5678"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <PrimaryButton
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Creando...' : 'Registrar'}
      </PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
});
