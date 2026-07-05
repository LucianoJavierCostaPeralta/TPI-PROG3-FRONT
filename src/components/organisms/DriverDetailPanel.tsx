import React from 'react';
import { StyleSheet, View, Alert, ScrollView } from 'react-native';
import { Surface, Text, useTheme, type MD3Theme } from 'react-native-paper';
import { InfoCard } from '../molecules/InfoCard';
import { CTAButton, UserAvatar } from '../atoms';
import { spacing, radii } from '../../styles/theme';
import { type Driver } from '../../types/workspace';

interface DriverDetailPanelProps {
  driver: Driver;
  onBack: () => void;
  onDelete?: (driverId: string) => void;
}

export function DriverDetailPanel({ driver, onBack, onDelete }: DriverDetailPanelProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  const vehicle = driver.vehiculo ?? driver.vehicle ?? driver.patente ?? 'No especificado';
  const zone = driver.zona ?? driver.zone ?? 'No especificada';

  const formatDateForDisplay = (value?: string | null) => {
    if (!value) return 'No especificada';
    const cleanValue = value.split('T')[0];
    if (!cleanValue) return 'No especificada';
    const parts = cleanValue.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return cleanValue;
  };

  const handleDeletePress = () => {
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarContainer}>
          <UserAvatar name={driver.nombre} size={80} />
          <Text variant="headlineSmall" style={styles.userName}>
            {driver.nombre}
          </Text>
          <View style={styles.roleBadge}>
            <Text variant="labelMedium" style={styles.roleBadgeText}>
              Chofer
            </Text>
          </View>
        </View>

        <Surface style={styles.section} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Datos Personales</Text>
          <View style={styles.infoList}>
            <InfoCard
              icon="account-outline"
              title="Nombre completo"
              description={driver.nombre}
            />
            <View style={styles.itemDivider} />
            <InfoCard
              icon="email-outline"
              title="Correo electrónico"
              description={driver.email || 'No especificado'}
            />
            <View style={styles.itemDivider} />
            <InfoCard
              icon="phone-outline"
              title="Número de teléfono"
              description={driver.telefono || 'No especificado'}
            />
            <View style={styles.itemDivider} />
            <InfoCard
              icon="card-account-details-outline"
              title="DNI"
              description={driver.documento || 'No especificado'}
            />
            <View style={styles.itemDivider} />
            <InfoCard
              icon="calendar-range"
              title="Fecha de nacimiento"
              description={formatDateForDisplay(driver.fecha_nacimiento)}
            />
            <View style={styles.itemDivider} />
            <InfoCard
              icon="truck-outline"
              title="Vehículo"
              description={String(vehicle)}
            />
            <View style={styles.itemDivider} />
            <InfoCard
              icon="map-marker-outline"
              title="Zona de reparto"
              description={String(zone)}
            />
            <View style={styles.itemDivider} />
            <InfoCard
              icon="toggle-switch-outline"
              title="Estado de la cuenta"
              description={driver.activo ? 'Activo' : 'Inactivo'}
            />
          </View>
        </Surface>

        {onDelete && (
          <View style={styles.actionsContainer}>
            <CTAButton
              variant="destructive"
              onPress={handleDeletePress}
              style={styles.actionButton}
            >
              Eliminar Chofer
            </CTAButton>
          </View>
        )}
      </ScrollView>
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
    avatarContainer: {
      alignItems: 'center',
      marginBottom: spacing.xl,
      marginTop: spacing.md,
    },
    userName: {
      color: theme.colors.onSurface,
      fontWeight: '700',
      textAlign: 'center',
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    roleBadge: {
      backgroundColor: theme.colors.secondaryContainer,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 16,
    },
    roleBadgeText: {
      color: theme.colors.onSecondaryContainer,
      fontWeight: '600',
    },
    section: {
      borderRadius: radii.md,
      padding: spacing.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      marginBottom: 24,
    },
    sectionTitle: {
      color: theme.colors.onSurface,
      fontWeight: '700',
      marginBottom: spacing.lg,
    },
    infoList: {
      gap: spacing.md,
    },
    itemDivider: {
      height: 1,
      backgroundColor: theme.colors.outline,
      marginVertical: spacing.xs,
      opacity: 0.2,
    },
    actionsContainer: {
      marginBottom: spacing.xl,
      gap: spacing.md,
    },
    actionButton: {
      width: '100%',
    },
  });
