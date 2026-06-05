import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

type TextInputFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function TextInputField({
  label,
  error,
  ...props
}: TextInputFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor="#d1d5db"
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 54,
    borderColor: '#e5e7eb',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f8fafc',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});
