import { ScrollView, View, StyleSheet } from 'react-native';
import { useTheme, type MD3Theme } from 'react-native-paper';
import { CTAButton } from '../atoms';
import { radii } from '../../styles/theme';
import { type DeliveryFilter } from '../../types/workspace';

type DeliveryFiltersProps = {
  filter: DeliveryFilter;
  onFilterChange: (filter: DeliveryFilter) => void;
};

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <CTAButton
      compact
      variant={active ? 'primary' : 'secondary'}
      onPress={onPress}
      style={styles.filterChip}
      labelStyle={styles.filterChipLabel}
    >
      {label}
    </CTAButton>
  );
}

export function DeliveryFilters({ filter, onFilterChange }: DeliveryFiltersProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <View style={styles.filterBarWrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <FilterChip label="Todos" active={filter === 'todos'} onPress={() => onFilterChange('todos')} />
        <FilterChip label="Pendientes" active={filter === 'pendiente'} onPress={() => onFilterChange('pendiente')} />
        <FilterChip label="En camino" active={filter === 'en camino'} onPress={() => onFilterChange('en camino')} />
        <FilterChip label="Realizados" active={filter === 'realizado'} onPress={() => onFilterChange('realizado')} />
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    filterBarWrapper: {
      backgroundColor: theme.colors.surfaceVariant,
      paddingVertical: 12,
      marginBottom: 8,
    },
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
    },
    filterChip: {
      minWidth: 100,
      borderRadius: radii.md,
    },
    filterChipLabel: {
      fontSize: 12,
      textAlign: 'center',
    },
  });
