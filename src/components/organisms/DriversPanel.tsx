import { StyleSheet, View, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { Text, IconButton, Surface, useTheme, type MD3Theme } from 'react-native-paper';
import { CTAButton, TextInputField, UserAvatar, EmptyState } from '../atoms';
import { DateField, SectionCard } from '../molecules';
import { radii, spacing } from '../../styles/theme';
import { DriverDetailPanel } from './DriverDetailPanel';
import {
  type Driver,
  type DriverForm,
  type DriverFilter,
  type DeliveryOrder,
} from '../../types/workspace';


const onlyDigits = (value: string, maxLength: number) => {
  return value.replace(/\D/g, '').slice(0, maxLength);
};

function DriverRow({ driver, onPress }: { driver: Driver; onPress: (driver: Driver) => void }) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const vehicle = driver.vehiculo ?? driver.vehicle ?? driver.patente ?? 'Sin vehiculo';
  const zone = driver.zona ?? driver.zone ?? 'Sin zona';

  return (
    <TouchableOpacity onPress={() => onPress(driver)} activeOpacity={0.7}>
      <Surface style={styles.driverCard} elevation={1}>
        <UserAvatar name={driver.nombre} style={styles.driverAvatar} />
        <View style={styles.flexContent}>
          <Text variant="titleSmall" style={styles.primaryText}>{driver.nombre}</Text>
          <Text variant="bodySmall" style={styles.mutedText}>Vehiculo: {String(vehicle)}</Text>
          <Text variant="bodySmall" style={styles.mutedText}>Zona: {String(zone)}</Text>
        </View>
        <View style={styles.driverTrailing}>
          <View style={[styles.statusBadge, driver.activo ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
            <Text variant="labelSmall" style={driver.activo ? styles.statusBadgeTextActive : styles.statusBadgeTextInactive}>
              {driver.activo ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
          <IconButton icon="chevron-right" size={20} onPress={() => onPress(driver)} />
        </View>
      </Surface>
    </TouchableOpacity>
  );
}

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

export function DriversPanel({
  form,
  drivers,
  orders = [],
  saving,
  showForm,
  filter,
  canCreate,
  isEditing = false,
  onFilterChange,
  onChange,
  onSubmit,
  onCancel,
  onDelete,
  onEdit,
  refreshing,
  onRefresh,
  selectedDriver,
  setSelectedDriver,
}: {
  form: DriverForm;
  drivers: Driver[];
  orders?: DeliveryOrder[];
  saving: boolean;
  showForm: boolean;
  filter: DriverFilter;
  canCreate: boolean;
  isEditing?: boolean;
  onFilterChange: (filter: DriverFilter) => void;
  onChange: (field: keyof DriverForm, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onDelete?: (driverId: string) => void;
  onEdit?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  selectedDriver: Driver | null;
  setSelectedDriver: (driver: Driver | null) => void;
}) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  const filteredDrivers = drivers.filter((driver) => {
    if (filter === 'activos') return driver.activo;
    if (filter === 'inactivos') return !driver.activo;
    return true;
  });

  if (selectedDriver && !isEditing) {
    return (
      <DriverDetailPanel
        driver={selectedDriver}
        orders={orders}
        onBack={() => setSelectedDriver(null)}
        onEdit={onEdit}
        onDelete={(driverId) => {
          if (onDelete) {
            onDelete(driverId);
          }
          setSelectedDriver(null);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      {!showForm && !isEditing && (
        <View style={styles.filterBarWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            <FilterChip label="Activos" active={filter === 'activos'} onPress={() => onFilterChange('activos')} />
            <FilterChip label="Inactivos" active={filter === 'inactivos'} onPress={() => onFilterChange('inactivos')} />
            <FilterChip label="Todos" active={filter === 'todos'} onPress={() => onFilterChange('todos')} />
          </ScrollView>
        </View>
      )}

      {canCreate && (showForm || isEditing) ? (
        <ScrollView contentContainerStyle={styles.formScroll}>
          <SectionCard style={styles.formCard}>
            <View style={styles.formContent}>
              <TextInputField
                label="Nombre y Apellido"
                placeholder="Ej: Juan Perez"
                value={form.nombre}
                onChangeText={(value) => onChange('nombre', value)}
                disabled={saving}
                icon="account-outline"
              />
              <TextInputField
                label="DNI"
                placeholder="Ej: 12345678"
                value={form.documento}
                onChangeText={(value) => onChange('documento', onlyDigits(value, 8))}
                keyboardType="number-pad"
                disabled={saving}
                icon="card-account-details-outline"
              />
              <TextInputField
                label="Email"
                placeholder="Ej: juan@email.com"
                value={form.email}
                onChangeText={(value: string) => onChange('email', value.trim())}
                keyboardType="email-address"
                autoCapitalize="none"
                disabled={saving}
                icon="email-outline"
              />
              <DateField
                label="Fecha de nacimiento"
                placeholder="Seleccionar fecha"
                value={form.fechaNacimiento}
                onChange={(value: string) => onChange('fechaNacimiento', value)}
                disabled={saving}
                icon="calendar-outline"
                maximumDate={new Date(Date.now() - 86_400_000)}
              />
              <TextInputField
                label="Teléfono"
                placeholder="Ej: 5491112345678"
                value={form.telefono}
                onChangeText={(value: string) => onChange('telefono', onlyDigits(value, 15))}
                keyboardType="phone-pad"
                disabled={saving}
                icon="phone-outline"
              />
              {!isEditing ? (
                <Text variant="bodySmall" style={styles.mutedText}>
                  El chofer podrá ingresar con su email y contraseña inicial 123456.
                </Text>
              ) : null}
            </View>
            <View style={styles.formActions}>
              <CTAButton variant="secondary" onPress={onCancel} disabled={saving} style={styles.actionButton}>
                Cancelar
              </CTAButton>
              <CTAButton onPress={onSubmit} loading={saving} disabled={saving} style={styles.actionButton}>
                {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Guardar'}
              </CTAButton>
            </View>
          </SectionCard>
        </ScrollView>
      ) : (
        <FlatList
          data={filteredDrivers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DriverRow driver={item} onPress={setSelectedDriver} />}
          ListEmptyComponent={<EmptyState text="No hay choferes para este filtro." />}
          contentContainerStyle={styles.scrollContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    filterBar: {
      height: 48,
      marginBottom: 12,
    },
    driverAvatar: {
      marginRight: spacing.md,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 96,
      gap: 14,
    },
    formScroll: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 96,
    },
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
    formCard: {
      padding: 0,
      borderWidth: 0,
      backgroundColor: 'transparent',
    },
    orderHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    cardTitle: {
      color: theme.colors.onSurface,
      fontWeight: '700',
    },
    flexContent: {
      flex: 1,
    },
    formContent: {
      gap: spacing.sm,
    },
    mutedText: {
      color: theme.colors.onSurfaceVariant,
    },
    formActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 10,
    },
    actionButton: {
      flex: 1,
    },
    driverCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    primaryText: {
      color: theme.colors.onSurface,
      fontWeight: '700',
    },
    driverTrailing: {
      alignItems: 'flex-end',
      gap: 2,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
    },
    statusBadgeActive: {
      backgroundColor: theme.colors.secondaryContainer,
    },
    statusBadgeInactive: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    statusBadgeTextActive: {
      color: theme.colors.secondary,
      fontWeight: '700',
    },
    statusBadgeTextInactive: {
      color: theme.colors.onSurfaceVariant,
      fontWeight: '700',
    },
  });
