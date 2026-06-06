import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, type MD3Theme } from 'react-native-paper';
import { Title } from '../atoms/Typography';
import { spacing, typography } from '../../styles/theme';

export type FleetSize = '1-10' | '11-30' | '31-100' | 'Más de 100';

type VehicleSelectorProps = {
  value: FleetSize;
  onChange: (value: FleetSize) => void;
};

const options: FleetSize[] = ['1-10', '11-30', '31-100', 'Más de 100'];

export function VehicleSelector({ value, onChange }: VehicleSelectorProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Title style={styles.title}>
        ¿Cuántos vehículos posee actualmente su empresa?
      </Title>
      <View style={styles.grid}>
        {options.map((option) => {
          const isActive = value === option;

          return (
            <Pressable
              key={option}
              style={[
                styles.button,
                isActive && styles.buttonActive,
              ]}
              onPress={() => onChange(option)}
            >
              <Text
                style={[
                  styles.buttonText,
                  isActive && styles.buttonTextActive,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: 28,
    },
    title: {
      ...typography.bodyLg,
      color: theme.colors.onSurface,
      fontWeight: '700',
      marginBottom: spacing.lg,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    button: {
      flex: 1,
      minWidth: '45%',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
    },
    buttonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    buttonText: {
      ...typography.bodySm,
      color: theme.colors.onSurface,
      fontWeight: '600',
    },
    buttonTextActive: {
      color: theme.colors.onPrimary,
    },
  });
