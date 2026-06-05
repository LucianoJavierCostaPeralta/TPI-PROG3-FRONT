import { StyleSheet, View } from 'react-native';
import { SecondaryButton } from '../atoms/SecondaryButton';
import { Body, Caption } from '../atoms/Typography';

type RegisterFooterProps = {
  onConsultWithAdvisor: () => void;
};

export function RegisterFooter({ onConsultWithAdvisor }: RegisterFooterProps) {
  return (
    <View style={styles.container}>
      <Body style={styles.question}>¿No tienes una cuenta?</Body>
      <Caption style={styles.description}>
        Si su empresa no está registrada, un asesor puede ayudarle a crear y
        configurar su cuenta.
      </Caption>

      <SecondaryButton onPress={onConsultWithAdvisor}>
        Consultar con un asesor
      </SecondaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  question: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
});
