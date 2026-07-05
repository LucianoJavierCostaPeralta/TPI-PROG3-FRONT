import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

interface RouteProgressProps {
  completed: number;
  total: number;
}

export function RouteProgress({ completed, total }: RouteProgressProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.title}>
          Progreso de Ruta
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {`${completed} de ${total} paradas completadas`}
        </Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    color: '#1C1B1F',
  },
  subtitle: {
    color: '#7C7C7C',
    fontSize: 13,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#2196F3',
  },
});
