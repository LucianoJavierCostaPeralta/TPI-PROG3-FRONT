import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Title } from '../atoms/Typography';

type FleetSize = '1-10' | '11-30' | '31-100' | 'Más de 100';

type VehicleSelectorProps = {
  value: FleetSize;
  onChange: (value: FleetSize) => void;
};

const options: FleetSize[] = ['1-10', '11-30', '31-100', 'Más de 100'];

export function VehicleSelector({ value, onChange }: VehicleSelectorProps) {
  return (
    <View style={styles.container}>
      <Title style={styles.title}>
        ¿Cuántos vehículos posee actualmente su empresa?
      </Title>
      <View style={styles.grid}>
        {options.map((option) => (
          <Pressable
            key={option}
            style={[
              styles.button,
              value === option && styles.buttonActive,
            ]}
            onPress={() => onChange(option)}
          >
            <Text
              style={[
                styles.buttonText,
                value === option && styles.buttonTextActive,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  buttonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextActive: {
    color: '#ffffff',
  },
});
