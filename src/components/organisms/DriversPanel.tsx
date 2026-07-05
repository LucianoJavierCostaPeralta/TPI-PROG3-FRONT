import { useState } from 'react';
import { StyleSheet, View, ScrollView, Platform, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, IconButton, Surface, useTheme, type MD3Theme, TextInput as PaperTextInput } from 'react-native-paper';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { CTAButton, TextInputField, UserAvatar, EmptyState } from '../atoms';
import { radii, spacing, palette } from '../../styles/theme';
import {
  type Driver,
  type DriverForm,
  type DriverFilter,
  parseDeliveryFormDate,
  formatDateForInput,
  formatDateForDisplay,
} from '../../types/workspace';


const onlyDigits = (value: string, maxLength: number) => {
  return value.replace(/\D/g, '').slice(0, maxLength);
};

function DriverRow({ driver, onDelete }: { driver: Driver; onDelete?: (driverId: string) => void }) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const vehicle = driver.vehiculo ?? driver.vehicle ?? driver.patente ?? 'Sin vehiculo';
  const zone = driver.zona ?? driver.zone ?? 'Sin zona';

  const handlePress = () => {
    Alert.alert(
      'Eliminar Chofer',
      `¿Estás seguro de que deseas eliminar a ${driver.nombre}? Esta acción no se puede deshacer.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              onDelete(driver.id);
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
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
          <IconButton icon="chevron-right" size={20} onPress={handlePress} />
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
  saving,
  showForm,
  filter,
  canCreate,
  onFilterChange,
  onChange,
  onSubmit,
  onCancel,
  onDelete,
  refreshing,
  onRefresh,
}: {
  form: DriverForm;
  drivers: Driver[];
  saving: boolean;
  showForm: boolean;
  filter: DriverFilter;
  canCreate: boolean;
  onFilterChange: (filter: DriverFilter) => void;
  onChange: (field: keyof DriverForm, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onDelete?: (driverId: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const [birthDatePickerVisible, setBirthDatePickerVisible] = useState(false);

  const selectedBirthDate = form.fechaNacimiento
    ? parseDeliveryFormDate(form.fechaNacimiento)
    : new Date(1990, 0, 1);

  const handleBirthDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setBirthDatePickerVisible(false);
    }
    if (date) {
      onChange('fechaNacimiento', formatDateForInput(date));
    }
  };

  const filteredDrivers = drivers.filter((driver) => {
    if (filter === 'activos') return driver.activo;
    if (filter === 'inactivos') return !driver.activo;
    return true;
  });

  return (
    <View style={styles.container}>
      {!showForm && (
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <FilterChip label="Activos" active={filter === 'activos'} onPress={() => onFilterChange('activos')} />
            <FilterChip label="Inactivos" active={filter === 'inactivos'} onPress={() => onFilterChange('inactivos')} />
            <FilterChip label="Todos" active={filter === 'todos'} onPress={() => onFilterChange('todos')} />
          </ScrollView>
        </View>
      )}

      {canCreate && showForm ? (
        <ScrollView contentContainerStyle={styles.formScroll}>
          <Surface style={styles.formCard} elevation={1}>
            <View style={styles.orderHeader}>
              <Text variant="titleMedium" style={[styles.cardTitle, styles.flexContent]}>Nuevo Chofer</Text>
              <IconButton icon="close" size={20} onPress={onCancel} disabled={saving} />
            </View>
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
                onChangeText={(value) => onChange('email', value.trim())}
                keyboardType="email-address"
                autoCapitalize="none"
                disabled={saving}
                icon="email-outline"
              />
              <TextInputField
                label="Fecha de nacimiento"
                placeholder="Seleccionar fecha"
                value={formatDateForDisplay(form.fechaNacimiento)}
                onPressIn={() => {
                  if (!saving) setBirthDatePickerVisible(true);
                }}
                editable={false}
                showSoftInputOnFocus={false}
                disabled={saving}
                icon="calendar-outline"
                right={
                  <PaperTextInput.Icon
                    icon="calendar-month-outline"
                    onPress={() => setBirthDatePickerVisible(true)}
                    disabled={saving}
                  />
                }
              />
              {birthDatePickerVisible ? (
                <DateTimePicker
                  value={selectedBirthDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={new Date(Date.now() - 86_400_000)}
                  onChange={handleBirthDateChange}
                />
              ) : null}
              {Platform.OS === 'ios' && birthDatePickerVisible ? (
                <CTAButton
                  compact
                  variant="secondary"
                  onPress={() => setBirthDatePickerVisible(false)}
                  style={styles.datePickerDoneButton}
                >
                  Listo
                </CTAButton>
              ) : null}
              <TextInputField
                label="Teléfono"
                placeholder="Ej: 5491112345678"
                value={form.telefono}
                onChangeText={(value) => onChange('telefono', onlyDigits(value, 15))}
                keyboardType="phone-pad"
                disabled={saving}
                icon="phone-outline"
              />
              <Text variant="bodySmall" style={styles.mutedText}>
                El chofer podrá ingresar con su email y contraseña inicial 123456.
              </Text>
            </View>
            <View style={styles.formActions}>
              <CTAButton variant="secondary" onPress={onCancel} disabled={saving} style={styles.actionButton}>
                Cancelar
              </CTAButton>
              <CTAButton onPress={onSubmit} loading={saving} disabled={saving} style={styles.actionButton}>
                {saving ? 'Guardando...' : 'Guardar'}
              </CTAButton>
            </View>
          </Surface>
        </ScrollView>
      ) : (
        <FlatList
          data={filteredDrivers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DriverRow driver={item} onDelete={onDelete} />}
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
    panel: {
      gap: 14,
    },
    filterRow: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 16,
    },
    filterChip: {
      minWidth: 94,
      borderRadius: radii.md,
      marginRight: spacing.sm,
    },
    filterChipLabel: {
      fontSize: 12,
    },
    formCard: {
      padding: 16,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface,
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
    datePickerDoneButton: {
      alignSelf: 'flex-end',
      borderRadius: radii.md,
      marginBottom: 8,
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
      backgroundColor: palette.successLightBg,
    },
    statusBadgeInactive: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    statusBadgeTextActive: {
      color: palette.successDark,
      fontWeight: '700',
    },
    statusBadgeTextInactive: {
      color: theme.colors.onSurfaceVariant,
      fontWeight: '700',
    },
  });
