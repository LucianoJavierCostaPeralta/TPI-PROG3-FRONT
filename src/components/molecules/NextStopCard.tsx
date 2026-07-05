import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { type DeliveryOrder } from '../../types/workspace';

interface NextStopCardProps {
  pendingOrders: DeliveryOrder[];
}

export function NextStopCard({ pendingOrders }: NextStopCardProps) {
  if (pendingOrders.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No quedan paradas pendientes</Text>
      </View>
    );
  }

  const nextOrder = pendingOrders[0];
  const thenOrder = pendingOrders.length > 1 ? pendingOrders[1] : null;

  // Direcciones
  const nextAddress = String(nextOrder.direccion_destino || nextOrder.direccion || 'Sin dirección registrada');
  const thenAddress = thenOrder ? String(thenOrder.direccion_destino || thenOrder.direccion || 'Sin dirección') : '';

  // Determinar los números de parada basados en su índice
  const nextNumber = nextOrder.orden_ruta ?? 1;
  const thenNumber = thenOrder ? (thenOrder.orden_ruta ?? 2) : 2;

  return (
    <View style={styles.container}>
      {/* PRÓXIMA PARADA */}
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

      {/* SECCIÓN LUEGO */}
      {thenOrder && (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  section: {
    paddingBottom: 12,
  },
  thenSection: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    color: '#7C7C7C',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  etaText: {
    fontWeight: 'bold',
    color: '#1C1B1F',
  },
  addressText: {
    fontWeight: 'bold',
    color: '#1C1B1F',
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
    borderColor: '#2196F3',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  nodeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  thenAddress: {
    flex: 1,
    color: '#1C1B1F',
    fontSize: 14,
  },
  thenEta: {
    color: '#7C7C7C',
    marginLeft: 10,
    fontSize: 13,
  },
  emptyText: {
    textAlign: 'center',
    color: '#7C7C7C',
    paddingVertical: 8,
  },
});
