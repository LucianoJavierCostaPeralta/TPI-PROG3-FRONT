import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, useTheme, type MD3Theme } from 'react-native-paper';
import { type DeliveryFilter } from '../../types/workspace';

type MarkerNodeProps = {
  index?: number;
  status?: DeliveryFilter;
  isDriver?: boolean;
  showIconOnly?: boolean;
};

const MarkerNodeComponent = ({ index = 1, status = 'pendiente', isDriver = false, showIconOnly = false }: MarkerNodeProps) => {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  const statusStyles =
    {
      pendiente: {
        borderColor: theme.colors.tertiary,
        backgroundColor: theme.colors.tertiaryContainer,
        textColor: theme.colors.onTertiaryContainer,
        iconName: 'clock-outline' as const,
        iconColor: theme.colors.tertiary,
      },
      realizado: {
        borderColor: theme.colors.secondary,
        backgroundColor: theme.colors.secondaryContainer,
        textColor: theme.colors.onSecondaryContainer,
        iconName: 'check' as const,
        iconColor: theme.colors.secondary,
      },
      'en camino': {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryContainer,
        textColor: theme.colors.onPrimaryContainer,
        iconName: 'truck-delivery-outline' as const,
        iconColor: theme.colors.primary,
      },
      todos: {
        borderColor: theme.colors.outline,
        backgroundColor: theme.colors.surface,
        textColor: theme.colors.onSurface,
        iconName: 'clock-outline' as const,
        iconColor: theme.colors.onSurface,
      },
    }[status] ?? {
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
      textColor: theme.colors.onSurface,
      iconName: 'clock-outline' as const,
      iconColor: theme.colors.onSurface,
    };

  if (isDriver) {
    return (
      <View style={[styles.container, styles.driverContainer]}>
        <MaterialCommunityIcons name="truck" size={16} color={theme.colors.onPrimary} />
      </View>
    );
  }

  if (showIconOnly) {
    return (
      <View style={styles.pinWrapper}>
        <View style={[styles.pinBackground, { backgroundColor: statusStyles.borderColor }]}>
          <View style={styles.pinInnerCircle}>
            <MaterialCommunityIcons name={statusStyles.iconName} size={15} color={statusStyles.borderColor} />
          </View>
        </View>
        <View style={[styles.pinTail, { borderTopColor: statusStyles.borderColor }]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderColor: statusStyles.borderColor, backgroundColor: statusStyles.backgroundColor }]}>
      {status === 'realizado' ? (
        <MaterialCommunityIcons name="check" size={16} color={statusStyles.iconColor} />
      ) : (
        <Text style={[styles.text, { color: statusStyles.textColor }]}>{index}</Text>
      )}
    </View>
  );
};

export const MarkerNode = React.memo(MarkerNodeComponent);

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 2.5,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
      shadowColor: theme.colors.onSurface,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
    },
    driverContainer: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.onPrimary,
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
      shadowColor: theme.colors.onSurface,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 2,
    },
    pinInnerCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.surface,
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
