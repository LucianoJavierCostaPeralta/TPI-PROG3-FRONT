import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme, type MD3Theme } from 'react-native-paper';

interface RouteProgressProps {
  completed: number;
  total: number;
}

export function RouteProgress({ completed, total }: RouteProgressProps) {
  const theme = useTheme<MD3Theme>();
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const styles = createStyles(theme);

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

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    title: {
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    subtitle: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 13,
    },
    progressBarBackground: {
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.outline,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
    },
  });
