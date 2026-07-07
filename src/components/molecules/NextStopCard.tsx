import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme, type MD3Theme } from 'react-native-paper';
import { type DeliveryOrder } from '../../types/workspace';

interface NextStopCardProps {
  pendingOrders: DeliveryOrder[];
}

export function NextStopCard({ pendingOrders }: NextStopCardProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  if (pendingOrders.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No quedan paradas pendientes</Text>
      </View>
    );
  }

  const nextOrder = pendingOrders[0];
  const thenOrder = pendingOrders.length > 1 ? pendingOrders[1] : null;

  const nextAddress = String(nextOrder.direccion_destino || nextOrder.direccion || 'Sin dirección registrada');
  const thenAddress = thenOrder ? String(thenOrder.direccion_destino || thenOrder.direccion || 'Sin dirección') : '';
  const nextNumber = nextOrder.orden_ruta ?? 1;
  const thenNumber = thenOrder ? (thenOrder.orden_ruta ?? 2) : 2;

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Text variant="labelMedium" style={styles.label}>
            PRÓXIMA PARADA
          </Text>
          <Text variant="bodyMedium" style={styles.etaText}>
            ETA: 12 min
          </Text>
        </View>
        <Text variant="titleMedium" style={styles.addressText} numberOfLines={2}>
          {nextAddress}
        </Text>
      </View>

      {thenOrder ? (
        <View style={styles.thenSection}>
          <Text variant="labelMedium" style={styles.label}>
            LUEGO
          </Text>
          <View style={styles.thenRow}>
            <View style={styles.nodeCircle}>
              <Text style={styles.nodeText}>{String(thenNumber)}</Text>
            </View>
            <Text variant="bodyLarge" style={styles.thenAddress} numberOfLines={1}>
              {thenAddress}
            </Text>
            <Text variant="bodyMedium" style={styles.thenEta}>
              ETA: 18 min
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      margin: 16,
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      elevation: 3,
      shadowColor: theme.colors.onSurface,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    section: {
      paddingBottom: 12,
    },
    thenSection: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      paddingTop: 12,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    label: {
      color: theme.colors.onSurfaceVariant,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    etaText: {
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    addressText: {
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    thenRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    nodeCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    nodeText: {
      fontSize: 9,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    thenAddress: {
      flex: 1,
      color: theme.colors.onSurface,
      fontSize: 14,
    },
    thenEta: {
      color: theme.colors.onSurfaceVariant,
      marginLeft: 10,
      fontSize: 13,
    },
    emptyText: {
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      paddingVertical: 8,
    },
  });
