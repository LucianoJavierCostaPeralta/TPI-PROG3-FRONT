import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Platform, TouchableOpacity, FlatList } from 'react-native';
import { Surface, Text, TextInput as PaperTextInput, Portal, Dialog, Button, useTheme, type MD3Theme } from 'react-native-paper';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { CTAButton, TextInputField, UserAvatar } from '../atoms';
import { spacing, radii, palette } from '../../styles/theme';
import { onlyDigits } from '../../utils/orders/deliveryStatus';
import {
  type Driver,
  type DeliveryForm,
  parseDeliveryFormDate,
  formatDateForInput,
  formatDateForDisplay,
} from '../../types/workspace';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DeliveryEditPanelProps {
  form: DeliveryForm;
  drivers: Driver[];
  onChange: (field: keyof DeliveryForm, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  saving: boolean;
}

export function DeliveryEditPanel({
  form,
  drivers,
  onChange,
  onSubmit,
  onCancel,
  saving,
}: DeliveryEditPanelProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [driverModalVisible, setDriverModalVisible] = useState(false);
  const selectedDate = parseDeliveryFormDate(form.fecha);

  const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setDatePickerVisible(false);
    }
    if (date) {
      onChange('fecha', formatDateForInput(date));
    }
  };

  const assignedDriver = drivers.find(
    (d) => d.usuario_id === form.choferId || d.id === form.choferId
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.formCard} elevation={1}>
          <View style={styles.formContent}>
            <TextInputField
              label="Cliente"
              placeholder="Nombre del cliente"
              value={form.cliente}
              onChangeText={(value) => onChange('cliente', value)}
              disabled={saving}
              icon="account-outline"
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
              placeholder="Dirección de entrega"
              value={form.destino}
              onChangeText={(value) => onChange('destino', value)}
              disabled={saving}
              icon="map-marker-outline"
            />
            <TextInputField
              label="Referencia"
              placeholder="Ej: Portón negro, timbre B"
              value={form.referencia}
              onChangeText={(value) => onChange('referencia', value)}
              disabled={saving}
              icon="tag-outline"
            />
            <TextInputField
              label="Fecha de entrega"
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
              <CTAButton
                compact
                variant="secondary"
                onPress={() => setDatePickerVisible(false)}
                style={styles.datePickerDoneButton}
              >
                Listo
              </CTAButton>
            ) : null}

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
            <CTAButton
              variant="secondary"
              onPress={onCancel}
              disabled={saving}
              style={styles.actionButton}
            >
              Cancelar
            </CTAButton>
            <CTAButton
              onPress={onSubmit}
              loading={saving}
              disabled={saving}
              style={styles.actionButton}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </CTAButton>
          </View>
        </Surface>
      </ScrollView>

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
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: spacing.xxxl,
    },
    formCard: {
      padding: 16,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    formContent: {
      gap: spacing.sm,
    },
    datePickerDoneButton: {
      alignSelf: 'flex-end',
      borderRadius: radii.md,
      marginBottom: 8,
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
    formActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 20,
    },
    actionButton: {
      flex: 1,
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
