import { Pressable, StyleSheet, Text, View } from 'react-native';

type CheckboxProps = {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  label: string;
};

export function Checkbox({ checked, onToggle, label }: CheckboxProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.checkboxRow}
        onPress={() => onToggle(!checked)}
      >
        <View style={[styles.checkboxBox, checked && styles.checkboxBoxChecked]}>
          {checked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#1976D2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginTop: 2,
  },
  checkboxBoxChecked: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  label: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});
