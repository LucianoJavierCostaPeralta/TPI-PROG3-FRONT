import { useState } from 'react';
import { StyleSheet, View, ScrollView, Platform, FlatList, TouchableOpacity } from 'react-native';
import { Text, IconButton, Surface, useTheme, type MD3Theme, TextInput as PaperTextInput, Portal, Dialog, Button } from 'react-native-paper';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CTAButton, TextInputField, EmptyState, UserAvatar } from '../atoms';
import { DeliveryFilters } from './DeliveryFilters';
import { DeliveryOrderCard } from './DeliveryOrderCard';
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
} from '../../types/workspace';
import { onlyDigits } from '../../utils/orders/deliveryStatus';

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
  setSelectedDelivery,
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
  setSelectedDelivery: (order: DeliveryOrder) => void;
}) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [driverModalVisible, setDriverModalVisible] = useState(false);
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

  if (orders.length === 0 && role === 'chofer') {
    return <EmptyState text="No tenes pedidos asignados." />;
  }

  return (
    <View style={styles.container}>
      {!showForm && (
        <DeliveryFilters filter={filter} onFilterChange={onFilterChange} />
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
              {(() => {
                const assignedDriver = drivers.find(d => d.usuario_id === form.choferId || d.id === form.choferId);
                return (
                  <TextInputField
                    label="Chofer asignado"
                    placeholder="Seleccionar chofer"
                    value={assignedDriver ? assignedDriver.nombre : 'Sin asignar'}
                    onPressIn={() => !saving && setDriverModalVisible(true)}
                    editable={false}
                    showSoftInputOnFocus={false}
                    disabled={saving}
                    icon="truck-delivery-outline"
                    right={
                      assignedDriver ? (
                        <PaperTextInput.Icon
                          icon="close-circle-outline"
                          onPress={() => onChange('choferId', '')}
                          disabled={saving}
                          color={palette.error}
                        />
                      ) : (
                        <PaperTextInput.Icon
                          icon="chevron-down"
                          onPress={() => setDriverModalVisible(true)}
                          disabled={saving}
                        />
                      )
                    }
                  />
                );
              })()}

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
          renderItem={({ item, index }) => (
            <DeliveryOrderCard order={item} index={index} onPress={setSelectedDelivery} />
          )}
          ListEmptyComponent={
            <EmptyState text={orders.length === 0 ? 'No hay pedidos asociados a esta empresa.' : 'No hay entregas para este filtro.'} />
          }
          contentContainerStyle={styles.scrollContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

      {/* MODAL DIALOG DE SELECCIÓN SEGURA DE CHOFER */}
      <Portal>
        <Dialog visible={driverModalVisible} onDismiss={() => setDriverModalVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Seleccionar Chofer</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            {drivers.length === 0 ? (
              <Text variant="bodyMedium" style={styles.emptyText}>No hay choferes disponibles.</Text>
            ) : (
              <FlatList
                data={drivers}
                keyExtractor={(item) => item.id}
                style={styles.dialogScroll}
                renderItem={({ item: driver }) => (
                  <TouchableOpacity
                    style={styles.dialogRow}
                    onPress={() => {
                      onChange('choferId', driver.usuario_id ?? driver.id);
                      setDriverModalVisible(false);
                    }}
                  >
                    <UserAvatar name={driver.nombre} size={36} style={styles.avatar} />
                    <View style={styles.dialogInfo}>
                      <Text variant="titleSmall" style={styles.dialogName}>{driver.nombre}</Text>
                      <Text variant="bodySmall" style={styles.dialogSub}>{driver.activo ? 'Activo' : 'Inactivo'}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#CCCCCC" />
                  </TouchableOpacity>
                )}
              />
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDriverModalVisible(false)}>Cancelar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    filterBarWrapper: {
      backgroundColor: theme.colors.surfaceVariant,
      paddingVertical: 12,
      marginBottom: 8,
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
    cleanOrderCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    cardLeftContent: {
      flex: 1,
      gap: 4,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 2,
    },
    cardPedId: {
      fontWeight: '800',
      color: theme.colors.onSurface,
    },
    cleanBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    cleanBadgeText: {
      fontWeight: '800',
    },
    badgePending: {
      backgroundColor: palette.pendingLightBg,
    },
    badgeOnWay: {
      backgroundColor: palette.infoLightBg,
    },
    badgeDelivered: {
      backgroundColor: palette.successLightBg,
    },
    badgeTextPending: {
      color: palette.warning,
    },
    badgeTextOnWay: {
      color: palette.secondary,
    },
    badgeTextDelivered: {
      color: palette.successDark,
    },
    cardAddress: {
      color: theme.colors.onSurface,
      fontSize: 14,
    },
    cardDate: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 12,
    },
    cardRightContent: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingLeft: 8,
    },
    choferSection: {
      marginVertical: spacing.xs,
      gap: 6,
    },
    choferLabel: {
      color: theme.colors.onSurface,
      fontWeight: '600',
    },
    assignedCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: radii.md,
      backgroundColor: palette.successLightBg,
      borderWidth: 1,
      borderColor: palette.success,
    },
    unassignedCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderStyle: 'dashed',
    },
    avatar: {
      marginRight: spacing.sm,
    },
    choferInfo: {
      flex: 1,
    },
    choferName: {
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    choferSub: {
      color: theme.colors.onSurfaceVariant,
    },
    removeBtn: {
      padding: 4,
    },
    unassignedText: {
      flex: 1,
      color: theme.colors.onSurfaceVariant,
      fontStyle: 'italic',
    },
    dialog: {
      backgroundColor: theme.colors.surface,
      borderRadius: radii.md,
    },
    dialogTitle: {
      fontWeight: '700',
    },
    dialogContent: {
      maxHeight: 300,
    },
    dialogScroll: {
      gap: 8,
    },
    dialogRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    dialogInfo: {
      flex: 1,
    },
    dialogName: {
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    dialogSub: {
      color: theme.colors.onSurfaceVariant,
    },
    emptyText: {
      color: theme.colors.onSurfaceVariant,
      fontStyle: 'italic',
      textAlign: 'center',
    },
  });
