import { ActivityIndicator, StyleSheet, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Surface, Text, useTheme, type MD3Theme, IconButton } from 'react-native-paper';
import { ScreenLayout } from './ScreenLayout';
import { CTAButton, TextInputField, UserAvatar } from '../atoms';
import { DateField, SectionCard } from '../molecules';
import { dimensions, radii, spacing } from '../../styles/theme';
import { getRoleLabel } from '../../utils/profile/editProfile';
import type { AuthUser } from '../../services/api';
import type { EditProfileFormErrors, EditProfileFormFields } from '../../utils/profile/editProfile';

export type EditarPerfilTemplateProps = {
  error: string;
  form: EditProfileFormFields;
  formErrors: EditProfileFormErrors;
  isChofer: boolean;
  loading: boolean;
  saving: boolean;
  selectedImageUri: string | null;
  user: AuthUser | null;
  onBack: () => void;
  onCancel: () => void;
  onLoadProfile: () => void;
  onPickImage: () => void;
  onSave: () => void;
  onChangeField: (field: keyof EditProfileFormFields, value: string) => void;
};

export function EditarPerfilTemplate({
  error,
  form,
  formErrors,
  isChofer,
  loading,
  saving,
  selectedImageUri,
  user,
  onBack,
  onCancel,
  onLoadProfile,
  onPickImage,
  onSave,
  onChangeField,
}: EditarPerfilTemplateProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <ScreenLayout
      title="Editar Perfil"
      subtitle="Modifica tus datos de contacto"
      onBack={onBack}
      disabledBack={saving}
      scrollable={!loading && !error && !!user}
    >
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error && !user ? (
        <View style={styles.center}>
          <Text variant="bodyMedium" style={styles.errorText}>{error}</Text>
          <IconButton icon="reload" size={24} onPress={onLoadProfile} />
        </View>
      ) : user ? (
        <>
          {error ? (
            <Surface style={styles.errorBanner} elevation={1}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </Surface>
          ) : null}

          <SectionCard title="Campos Editables" style={styles.section}>
            <View style={styles.avatarWrapper}>
              <UserAvatar
                name={form.nombre_completo || user.nombre_completo}
                size={dimensions.avatar.xl}
                imageUri={selectedImageUri}
                style={styles.avatarImage}
              />
              <IconButton
                icon="camera"
                size={20}
                mode="contained"
                containerColor={theme.colors.primary}
                iconColor={theme.colors.onPrimary}
                style={styles.avatarEditButton}
                onPress={onPickImage}
              />
            </View>

            <View style={styles.formContent}>
              <TextInputField
                label="Nombre completo"
                placeholder="Ingresá tu nombre completo"
                value={form.nombre_completo}
                onChangeText={(v: string) => onChangeField('nombre_completo', v)}
                disabled={saving}
                error={formErrors.nombre_completo}
                icon="account-outline"
                style={styles.inputField}
                outlineStyle={styles.inputOutline}
              />

              <TextInputField
                label="Correo electrónico"
                placeholder="correo@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={form.email}
                onChangeText={(v: string) => onChangeField('email', v)}
                disabled={saving}
                error={formErrors.email}
                icon="email-outline"
                style={styles.inputField}
                outlineStyle={styles.inputOutline}
              />

              <TextInputField
                label="Número de teléfono"
                placeholder="1134567890"
                keyboardType="phone-pad"
                value={form.telefono}
                onChangeText={(v: string) => onChangeField('telefono', v.replace(/\D/g, '').slice(0, 15))}
                disabled={saving}
                error={formErrors.telefono}
                icon="phone-outline"
                style={styles.inputField}
                outlineStyle={styles.inputOutline}
              />

              {isChofer && (
                <DateField
                  label="Fecha de nacimiento"
                  placeholder="DD/MM/YYYY"
                  value={form.fecha_nacimiento}
                  onChange={(value: string) => onChangeField('fecha_nacimiento', value)}
                  disabled={saving}
                  error={formErrors.fecha_nacimiento}
                  icon="calendar-range"
                  maximumDate={new Date()}
                />
              )}
            </View>
          </SectionCard>

          <SectionCard title="Datos del Sistema (Solo lectura)" style={[styles.section, styles.readOnlySection]}>
            {isChofer && (
                <TextInputField
                  label="DNI"
                  value={user.dni || 'No especificado'}
                  editable={false}
                  disabled
                  icon="card-account-details-outline"
                  style={styles.inputField}
                  outlineStyle={styles.inputOutline}
                />
            )}

            <TextInputField
                label="Rol"
                value={getRoleLabel(user.rol?.nombre_rol)}
                editable={false}
                disabled
                icon="shield-account-outline"
                style={styles.inputField}
                outlineStyle={styles.inputOutline}
              />

            <TextInputField
              label="Estado de la cuenta"
                value={user.activo ? 'Activo' : 'Inactivo'}
                editable={false}
                disabled
                icon="toggle-switch-outline"
                style={styles.inputField}
                outlineStyle={styles.inputOutline}
              />
          </SectionCard>

          <View style={styles.actionsContainer}>
            <CTAButton
              variant="primary"
              onPress={onSave}
              style={styles.actionButton}
              disabled={saving}
              loading={saving}
            >
              Guardar cambios
            </CTAButton>
            <CTAButton
              variant="secondary"
              onPress={onCancel}
              style={styles.actionButton}
              disabled={saving}
            >
              Cancelar
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
    errorBanner: {
      backgroundColor: theme.colors.errorContainer,
      borderRadius: radii.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.error,
    },
    errorBannerText: {
      color: theme.colors.onErrorContainer,
      fontWeight: '600',
      textAlign: 'center',
    },
    section: {
      marginBottom: spacing.md,
    },
    readOnlySection: {
      opacity: 0.8,
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      color: theme.colors.onSurface,
      fontWeight: '700',
      marginBottom: spacing.md,
      fontFamily: 'Inter-SemiBold',
    },
    actionsContainer: {
      marginTop: spacing.xl,
      gap: spacing.md,
    },
    avatarWrapper: {
      alignSelf: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.xl,
      padding: spacing.sm,
      borderRadius: radii.pill,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      position: 'relative',
    },
    avatarImage: {
      width: dimensions.avatar.xl,
      height: dimensions.avatar.xl,
      borderRadius: dimensions.avatar.xl / 2,
    },
    avatarEditButton: {
      position: 'absolute',
      right: -4,
      bottom: -2,
    },
    formContent: {
      gap: spacing.sm,
    },
    inputField: {
      backgroundColor: theme.colors.surface,
      borderRadius: radii.md,
    },
    inputOutline: {
      borderRadius: radii.md,
      borderWidth: 1.2,
      borderColor: theme.colors.outlineVariant,
    },
    actionButton: {
      width: '100%',
    },
  });
