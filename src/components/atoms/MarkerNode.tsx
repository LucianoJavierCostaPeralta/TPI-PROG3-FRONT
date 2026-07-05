import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import { type DeliveryFilter } from '../../types/workspace';

interface MarkerNodeProps {
  index?: number;
  status?: DeliveryFilter;
  isDriver?: boolean;
  showIconOnly?: boolean;
}

const MarkerNodeComponent = ({ index = 1, status = 'pendiente', isDriver = false, showIconOnly = false }: MarkerNodeProps) => {
  if (isDriver) {
    return (
      <View style={[styles.container, styles.driverContainer]}>
        <MaterialCommunityIcons name="truck" size={16} color="#FFFFFF" />
      </View>
    );
  }

  // Definir colores basados en el estado homologado
  let borderColor = '#FF9800'; // Naranja para pendiente
  let backgroundColor = '#FFFFFF';
  let textColor = '#FF9800';
  let iconName = 'clock-outline';

  if (status === 'realizado') {
    borderColor = '#4CAF50'; // Verde para realizado
    textColor = '#4CAF50';
    iconName = 'check';
  } else if (status === 'en camino') {
    borderColor = '#2196F3'; // Azul para en camino
    textColor = '#2196F3';
    iconName = 'truck-delivery-outline';
  }

  if (showIconOnly) {
    // Teardrop pin design
    return (
      <View style={styles.pinWrapper}>
        <View style={[styles.pinBackground, { backgroundColor: borderColor }]}>
          <View style={styles.pinInnerCircle}>
            <MaterialCommunityIcons name={iconName as any} size={15} color={borderColor} />
          </View>
        </View>
        <View style={[styles.pinTail, { borderTopColor: borderColor }]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderColor, backgroundColor }]}>
      {status === 'realizado' ? (
        <MaterialCommunityIcons name="check" size={16} color="#4CAF50" />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{index}</Text>
      )}
    </View>
  );
};

export const MarkerNode = React.memo(MarkerNodeComponent);

const styles = StyleSheet.create({
  container: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  driverContainer: {
    backgroundColor: '#2196F3',
    borderColor: '#FFFFFF',
    borderWidth: 2.5,
  },
  text: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  pinWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 42,
  },
  pinBackground: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  pinInnerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
});
