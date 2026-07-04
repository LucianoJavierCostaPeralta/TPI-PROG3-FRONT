import { useState } from 'react';
import { StyleSheet, View, ScrollView, Platform, ActivityIndicator, FlatList } from 'react-native';
import { Text, IconButton, Surface, useTheme, type MD3Theme, Divider, TextInput as PaperTextInput } from 'react-native-paper';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { CTAButton, TextInputField, EmptyState } from '../atoms';
import { radii, spacing, palette } from '../../styles/theme';
import {
  type Driver,
  type DeliveryOrder,
  type DeliveryFilter,
  type DeliveryForm,
  parseDeliveryFormDate,
  formatDateForInput,
  formatDateForDisplay,
  normalizeOrderStatus,
  getBackendStatusLabel,
  getOrderTitle,
  getOrderField,
  getOrderDestination,
  getOrderProducts,
  getAssignedDriverName,
  formatOrderDate,
} from '../../types/workspace';

// Helper input sanitization
const onlyDigits = (value: string, maxLength: number) => {
  return value.replace(/\D/g, '').slice(0, maxLength);
};

function getOrderStatusStyle(status: DeliveryFilter, styles: ReturnType<typeof createStyles>) {
  if (status === 'realizado') return styles.orderStatusDone;
  if (status === 'en camino') return styles.orderStatusOnWay;
  return styles.orderStatusPending;
}

function OrderMeta({ label, value }: { label: string; value: string | null }) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <View style={styles.orderMetaItem}>
      <Text variant="labelSmall" style={styles.inputLabel}>{label}</Text>
      <Text variant="bodySmall" style={styles.primaryText} numberOfLines={2}>{value ?? '-'}</Text>
    </View>
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

export function DeliveriesPanel({
  role,
  form,
  orders,
  drivers,
  assigningOrderId,
  updatingOrderId,
  filter,
  saving,
  showForm,
  onFilterChange,
  onChange,
  onSubmit,
  onCancel,
  onAssign,
  onUpdateStatus,
  refreshing,
  onRefresh,
}: {
  role: 'administrador' | 'asesor' | 'chofer';
  form: DeliveryForm;
  orders: DeliveryOrder[];
  drivers: Driver[];
  assigningOrderId: string | null;
  updatingOrderId: string | null;
  filter: DeliveryFilter;
  saving: boolean;
  showForm: boolean;
  onFilterChange: (filter: DeliveryFilter) => void;
  onChange: (field: keyof DeliveryForm, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onAssign: (orderId: string, driverId: string | null) => void;
  onUpdateStatus: (orderId: string, action: string, clienteDni?: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [deliveryDnis, setDeliveryDnis] = useState<Record<string, string>>({});
  const selectedDate = parseDeliveryFormDate(form.fecha);

  const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setDatePickerVisible(false);
    }
    if (date) {
      onChange('fecha', formatDateForInput(date));
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'todos') return true;
    return normalizeOrderStatus(order.estado) === filter;
  });

  const renderOrderCard = ({ item: order }: { item: DeliveryOrder }) => {
    const assignedDriver = drivers.find((driver) => driver.usuario_id === order.chofer_id || driver.id === order.chofer_id);
    const currentStatus = normalizeOrderStatus(order.estado_id ?? order.estado);
    const isAssigning = assigningOrderId === order.id;
    const isUpdating = updatingOrderId === order.id;
    const canEditStatus = role === 'chofer';

    return (
      <Surface key={order.id} style={styles.orderCard} elevation={1}>
        <View style={styles.orderHeader}>
          <View style={styles.flexContent}>
            <Text variant="titleMedium" style={styles.cardTitle}>{getOrderTitle(order)}</Text>
            <Text variant="bodySmall" style={styles.mutedText}>{getOrderDestination(order)}</Text>
          </View>
          <View style={[styles.orderStatusBadge, getOrderStatusStyle(currentStatus, styles as any)]}>
            <Text variant="labelSmall" style={styles.orderStatusText}>{getBackendStatusLabel(order)}</Text>
          </View>
          {isAssigning || isUpdating ? <ActivityIndicator size="small" /> : null}
        </View>

        <View style={styles.orderMetaGrid}>
          <OrderMeta label="Cliente" value={getOrderField(order, ['cliente', 'cliente_nombre', 'nombre_cliente'])} />
          <OrderMeta label="Referencia" value={getOrderField(order, ['referencia', 'codigo_cliente', 'numero', 'codigo'])} />
          <OrderMeta label="Fecha" value={formatOrderDate(order)} />
          <OrderMeta
            label="Chofer"
            value={assignedDriver?.nombre ?? getAssignedDriverName(order) ?? (role === 'chofer' ? 'Vos' : 'Sin asignar')}
          />
        </View>

        {getOrderProducts(order) ? (
          <Text variant="bodySmall" style={styles.mutedText}>{getOrderProducts(order)}</Text>
        ) : null}

        <Divider style={styles.divider} />

        {role === 'administrador' ? (
          <View style={styles.sectionBlock}>
            <Text variant="labelLarge" style={styles.inputLabel}>Asignar chofer</Text>
            <View style={styles.driverActions}>
              {drivers.length === 0 ? (
                <Text variant="bodySmall" style={styles.mutedText}>Primero crea un chofer.</Text>
              ) : (
                drivers.map((driver) => (
                  <CTAButton
                    key={driver.id}
                    variant={driver.usuario_id === order.chofer_id || driver.id === order.chofer_id ? 'primary' : 'secondary'}
                    compact
                    onPress={() => onAssign(order.id, driver.usuario_id === order.chofer_id || driver.id === order.chofer_id ? null : driver.usuario_id ?? driver.id)}
                    disabled={isAssigning}
                    style={styles.smallButton}
                    labelStyle={styles.smallButtonLabel}
                  >
                    {driver.nombre.split(' ')[0]}
                  </CTAButton>
                ))
              )}
            </View>
          </View>
        ) : null}

        {canEditStatus ? (
          <View style={styles.sectionBlock}>
            {currentStatus === 'pendiente' ? (
              <CTAButton
                onPress={() => onUpdateStatus(order.id, 'on_the_way')}
                disabled={isUpdating}
                style={styles.smallButton}
                labelStyle={styles.smallButtonLabel}
              >
                Iniciar Entrega
              </CTAButton>
            ) : null}

            {currentStatus === 'en camino' ? (
              <View style={styles.formContent}>
                <TextInputField
                  label="Confirmar DNI del cliente"
                  placeholder="DNI del cliente para entrega"
                  value={deliveryDnis[order.id] ?? ''}
                  onChangeText={(val) => setDeliveryDnis((prev) => ({ ...prev, [order.id]: onlyDigits(val, 8) }))}
                  keyboardType="number-pad"
                  disabled={isUpdating}
                />
                <CTAButton
                  onPress={() => onUpdateStatus(order.id, 'delivered', deliveryDnis[order.id])}
                  disabled={isUpdating}
                  style={styles.smallButton}
                  labelStyle={styles.smallButtonLabel}
                >
                  Finalizar Entrega
                </CTAButton>
              </View>
            ) : null}
          </View>
        ) : null}
      </Surface>
    );
  };

  if (orders.length === 0 && role === 'chofer') {
    return <EmptyState text="No tenes pedidos asignados." />;
  }

  return (
    <View style={styles.container}>
      {!showForm && (
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <FilterChip label="Todos" active={filter === 'todos'} onPress={() => onFilterChange('todos')} />
            <FilterChip label="Pendientes" active={filter === 'pendiente'} onPress={() => onFilterChange('pendiente')} />
            <FilterChip label="En camino" active={filter === 'en camino'} onPress={() => onFilterChange('en camino')} />
            <FilterChip label="Realizados" active={filter === 'realizado'} onPress={() => onFilterChange('realizado')} />
          </ScrollView>
        </View>
      )}

      {role === 'administrador' && showForm ? (
        <ScrollView contentContainerStyle={styles.formScroll}>
          <Surface style={styles.formCard} elevation={1}>
            <View style={styles.orderHeader}>
              <Text variant="titleMedium" style={[styles.cardTitle, styles.flexContent]}>Nueva entrega</Text>
              <IconButton icon="close" size={20} onPress={onCancel} disabled={saving} />
            </View>
            <View style={styles.formContent}>
              <TextInputField
                label="Cliente"
                placeholder="Buscar cliente"
                value={form.cliente}
                onChangeText={(value) => onChange('cliente', value)}
                disabled={saving}
                icon="account-search-outline"
              />
              <TextInputField
                label="DNI del cliente"
                placeholder="12345678"
                value={form.clienteDni}
                onChangeText={(value) => onChange('clienteDni', onlyDigits(value, 8))}
                keyboardType="number-pad"
                disabled={saving}
                icon="card-account-details-outline"
              />
              <TextInputField
                label="Destino"
                placeholder="Direccion de entrega"
                value={form.destino}
                onChangeText={(value) => onChange('destino', value)}
                disabled={saving}
                icon="map-marker-outline"
              />
              <TextInputField
                label="Referencia"
                placeholder="Ej: Pedido del cliente"
                value={form.referencia}
                onChangeText={(value) => onChange('referencia', value)}
                disabled={saving}
                icon="barcode-scan"
              />
              <TextInputField
                label="Fecha"
                placeholder="Seleccionar fecha"
                value={formatDateForDisplay(form.fecha)}
                onPressIn={() => {
                  if (!saving) setDatePickerVisible(true);
                }}
                editable={false}
                showSoftInputOnFocus={false}
                disabled={saving}
                icon="calendar-outline"
                right={
                  <PaperTextInput.Icon
                    icon="calendar-month-outline"
                    onPress={() => setDatePickerVisible(true)}
                    disabled={saving}
                  />
                }
              />
              {datePickerVisible ? (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                />
              ) : null}
              {Platform.OS === 'ios' && datePickerVisible ? (
                <CTAButton compact variant="secondary" onPress={() => setDatePickerVisible(false)} style={styles.datePickerDoneButton}>
                  Listo
                </CTAButton>
              ) : null}
              <TextInputField
                label="Productos"
                placeholder="Detalle de productos"
                value={form.productos}
                onChangeText={(value) => onChange('productos', value)}
                disabled={saving}
                icon="package-variant-closed"
              />
              <TextInputField
                label="Observaciones"
                placeholder="Observaciones adicionales"
                value={form.observaciones}
                onChangeText={(value) => onChange('observaciones', value)}
                disabled={saving}
                icon="text-box-outline"
                multiline
                numberOfLines={3}
              />
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
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderCard}
          ListEmptyComponent={
            <EmptyState text={orders.length === 0 ? 'No hay pedidos asociados a esta empresa.' : 'No hay entregas para este filtro.'} />
          }
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
    orderCard: {
      padding: 14,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface,
      gap: 10,
    },
    orderStatusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
    },
    orderStatusPending: {
      backgroundColor: palette.pendingLightBg,
    },
    orderStatusOnWay: {
      backgroundColor: palette.infoLightBg,
    },
    orderStatusDone: {
      backgroundColor: palette.successLightBg,
    },
    orderStatusText: {
      color: theme.colors.onSurface,
      fontWeight: '800',
    },
    orderMetaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    orderMetaItem: {
      width: '47%',
      minWidth: 130,
      gap: 2,
    },
    inputLabel: {
      color: theme.colors.onSurfaceVariant,
    },
    primaryText: {
      color: theme.colors.onSurface,
      fontWeight: '700',
    },
    divider: {
      backgroundColor: theme.colors.outline,
      marginVertical: 4,
    },
    sectionBlock: {
      gap: 8,
    },
    driverActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
    },
    smallButton: {
      borderRadius: radii.md,
    },
    smallButtonLabel: {
      fontSize: 12,
    },
  });
