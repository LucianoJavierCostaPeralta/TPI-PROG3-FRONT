import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { IconButton, Surface, Text, useTheme, type MD3Theme } from 'react-native-paper';
import { InfoCard } from '../components/molecules/InfoCard';
import { CTAButton, UserAvatar } from '../components/atoms';
import { getProfile, type AuthUser } from '../services/api';
import { spacing, radii, dimensions } from '../styles/theme';
import { ScreenLayout } from '../components/templates';

type PerfilScreenProps = {
  onBack: () => void;
  onEdit: () => void;
};

export function PerfilScreen({ onBack, onEdit }: PerfilScreenProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const profileData = await getProfile();
      setUser(profileData);
    } catch (err) {
      setError('No se pudo cargar la información del perfil.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const getRoleLabel = (roleName?: string) => {
    if (!roleName) return 'Usuario';
    const lower = roleName.toLowerCase();
    if (lower === 'chofer') return 'Chofer';
    if (lower === 'administrador') return 'Administrador';
    if (lower === 'asesor') return 'Asesor';
    return roleName.charAt(0).toUpperCase() + roleName.slice(1);
  };

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

  const isChofer = user?.rol?.nombre_rol?.toLowerCase() === 'chofer';

  return (
    <ScreenLayout
      title="Mi Perfil"
      subtitle="Información de tu cuenta"
      onBack={onBack}
      scrollable={!loading && !error && !!user}
    >
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text variant="bodyMedium" style={styles.errorText}>{error}</Text>
          <IconButton icon="reload" size={24} onPress={loadProfile} />
        </View>
      ) : user ? (
        <>
          <View style={styles.avatarContainer}>
            <UserAvatar name={user.nombre_completo} size={88} />
            <Text variant="headlineSmall" style={styles.userName}>
              {user.nombre_completo}
            </Text>
            <View style={styles.roleBadge}>
              <Text variant="labelMedium" style={styles.roleBadgeText}>
                {getRoleLabel(user.rol?.nombre_rol)}
              </Text>
            </View>
          </View>

          <Surface style={styles.section} elevation={1}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Datos Personales</Text>
            <View style={styles.infoList}>
              <InfoCard
                icon="account-outline"
                title="Nombre completo"
                description={user.nombre_completo}
              />
              <View style={styles.itemDivider} />
              <InfoCard
                icon="email-outline"
                title="Correo electrónico"
                description={user.email}
              />
              <View style={styles.itemDivider} />
              <InfoCard
                icon="phone-outline"
                title="Número de teléfono"
                description={user.telefono || 'No especificado'}
              />
              {isChofer && (
                <>
                  <View style={styles.itemDivider} />
                  <InfoCard
                    icon="card-account-details-outline"
                    title="DNI"
                    description={user.dni || 'No especificado'}
                  />
                  <View style={styles.itemDivider} />
                  <InfoCard
                    icon="calendar-range"
                    title="Fecha de nacimiento"
                    description={formatDateForDisplay(user.fecha_nacimiento)}
                  />
                </>
              )}
              <View style={styles.itemDivider} />
              <InfoCard
                icon="shield-account-outline"
                title="Rol del usuario"
                description={getRoleLabel(user.rol?.nombre_rol)}
              />
              <View style={styles.itemDivider} />
              <InfoCard
                icon="toggle-switch-outline"
                title="Estado de la cuenta"
                description={user.activo ? 'Activo' : 'Inactivo'}
              />
            </View>
          </Surface>

          <View style={styles.actionsContainer}>
            <CTAButton variant="primary" onPress={onEdit} style={styles.actionButton}>
              Editar Perfil
            </CTAButton>
          </View>
        </>
      ) : null}
    </ScreenLayout>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
      minHeight: dimensions.minHeight.lg,
    },
    errorText: {
      color: theme.colors.error,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: spacing.xl,
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
      marginTop: spacing.xl,
      gap: spacing.md,
    },
    actionButton: {
      width: '100%',
    },
  });
