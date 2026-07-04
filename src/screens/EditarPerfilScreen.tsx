import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { IconButton, Surface, Text, useTheme, type MD3Theme } from 'react-native-paper';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { CTAButton, TextInputField, UserAvatar } from '../components/atoms';
import { getProfile, updateProfile, type AuthUser } from '../services/api';
import { isValidEmail, onlyDigits, isPastDate } from '../utils/validation';
import { spacing, radii, dimensions } from '../styles/theme';
import { ScreenLayout } from '../components/templates';

type EditarPerfilScreenProps = {
  onBack: () => void;
  onSaveSuccess: () => void;
};

type FormFields = {
  nombre_completo: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
};

type FormErrors = {
  nombre_completo?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
};

export function EditarPerfilScreen({ onBack, onSaveSuccess }: EditarPerfilScreenProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Form states
  const [form, setForm] = useState<FormFields>({
    nombre_completo: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
  });

  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const isChofer = user?.rol?.nombre_rol?.toLowerCase() === 'chofer';

  const loadProfileData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const profileData = await getProfile();
      setUser(profileData);
      setForm({
        nombre_completo: profileData.nombre_completo || '',
        email: profileData.email || '',
        telefono: profileData.telefono || '',
        fecha_nacimiento: profileData.fecha_nacimiento ? profileData.fecha_nacimiento.split('T')[0] : '',
      });
    } catch (err) {
      setError('No se pudo cargar la información del perfil.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfileData();
  }, [loadProfileData]);

  const handleInputChange = (field: keyof FormFields, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  // Date picker utilities
  const parseFormDate = (value: string) => {
    if (!value) return new Date(1990, 0, 1);
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? new Date(1990, 0, 1) : date;
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateForDisplay = (value: string) => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return value;
  };

  const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setDatePickerVisible(false);
    }
    if (date) {
      handleInputChange('fecha_nacimiento', formatDateForInput(date));
    }
  };

  const validate = () => {
    const errors: FormErrors = {};

    if (!form.nombre_completo.trim()) {
      errors.nombre_completo = 'El nombre completo es requerido.';
    } else if (form.nombre_completo.trim().length < 3) {
      errors.nombre_completo = 'El nombre debe tener al menos 3 caracteres.';
    }

    if (!form.email.trim()) {
      errors.email = 'El correo electrónico es requerido.';
    } else if (!isValidEmail(form.email)) {
      errors.email = 'Ingresá un correo electrónico válido.';
    }

    if (form.telefono && !/^\d{8,15}$/.test(form.telefono)) {
      errors.telefono = 'El teléfono debe tener entre 8 y 15 dígitos.';
    }

    if (isChofer && form.fecha_nacimiento && !isPastDate(form.fecha_nacimiento)) {
      errors.fecha_nacimiento = 'La fecha de nacimiento debe ser anterior al día actual.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !user) return;

    setSaving(true);
    setError('');
    try {
      await updateProfile(
        user.id,
        user.rol?.nombre_rol || '',
        {
          nombre_completo: form.nombre_completo.trim(),
          email: form.email.trim().toLowerCase(),
          telefono: form.telefono.trim() || null,
          fecha_nacimiento: isChofer ? (form.fecha_nacimiento.trim() || null) : null,
        }
      );
      onSaveSuccess();
    } catch (err) {
      setError('No se pudo guardar los cambios. Revisa los datos ingresados.');
    } finally {
      setSaving(false);
    }
  };

  const getRoleLabel = (roleName?: string) => {
    if (!roleName) return 'Usuario';
    const lower = roleName.toLowerCase();
    if (lower === 'chofer') return 'Chofer';
    if (lower === 'administrador') return 'Administrador';
    if (lower === 'asesor') return 'Asesor';
    return roleName.charAt(0).toUpperCase() + roleName.slice(1);
  };

  const selectedDate = form.fecha_nacimiento
    ? parseFormDate(form.fecha_nacimiento)
    : new Date(1990, 0, 1);

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
          <IconButton icon="reload" size={24} onPress={loadProfileData} />
        </View>
      ) : user ? (
        <>
          {error ? (
            <Surface style={styles.errorBanner} elevation={1}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </Surface>
          ) : null}

          <Surface style={styles.section} elevation={1}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Campos Editables</Text>

            <UserAvatar
              name={form.nombre_completo || user.nombre_completo}
              size={dimensions.avatar.lg}
              style={styles.userAvatar}
            />

            <View style={styles.formContent}>
            <TextInputField
              label="Nombre completo"
              placeholder="Ingresá tu nombre completo"
              value={form.nombre_completo}
              onChangeText={(v) => handleInputChange('nombre_completo', v)}
              disabled={saving}
              error={formErrors.nombre_completo}
              icon="account-outline"
            />

            <TextInputField
              label="Correo electrónico"
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={form.email}
              onChangeText={(v) => handleInputChange('email', v)}
              disabled={saving}
              error={formErrors.email}
              icon="email-outline"
            />

            <TextInputField
              label="Número de teléfono"
              placeholder="1134567890"
              keyboardType="phone-pad"
              value={form.telefono}
              onChangeText={(v) => handleInputChange('telefono', onlyDigits(v, 15))}
              disabled={saving}
              error={formErrors.telefono}
              icon="phone-outline"
            />

            {isChofer && (
              <>
                <View style={styles.datePickerContainer}>
                  <TextInputField
                    label="Fecha de nacimiento"
                    placeholder="DD/MM/YYYY"
                    value={formatDateForDisplay(form.fecha_nacimiento)}
                    editable={false}
                    pointerEvents="none"
                    error={formErrors.fecha_nacimiento}
                    icon="calendar-range"
                    right={
                      <IconButton
                        icon="calendar"
                        size={20}
                        style={styles.calendarIcon}
                        onPress={() => !saving && setDatePickerVisible(true)}
                      />
                    }
                  />
                </View>

                {datePickerVisible ? (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
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
              </>
            )}
            </View>
          </Surface>

          <Surface style={[styles.section, styles.readOnlySection]} elevation={1}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Datos del Sistema (Solo lectura)</Text>

            <View style={styles.formContent}>
            {isChofer && (
              <TextInputField
                label="DNI"
                value={user.dni || 'No especificado'}
                editable={false}
                disabled
                icon="card-account-details-outline"
              />
            )}

            <TextInputField
              label="Rol"
              value={getRoleLabel(user.rol?.nombre_rol)}
              editable={false}
              disabled
              icon="shield-account-outline"
            />

            <TextInputField
              label="Estado de la cuenta"
              value={user.activo ? 'Activo' : 'Inactivo'}
              editable={false}
              disabled
              icon="toggle-switch-outline"
            />
            </View>
          </Surface>

          <View style={styles.actionsContainer}>
            <CTAButton
              variant="primary"
              onPress={handleSave}
              style={styles.actionButton}
              disabled={saving}
              loading={saving}
            >
              Guardar cambios
            </CTAButton>
            <CTAButton
              variant="secondary"
              onPress={onBack}
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
      borderRadius: radii.md,
      padding: spacing.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
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
    },
    datePickerContainer: {
      position: 'relative',
    },
    calendarIcon: {
      margin: 0,
      position: 'absolute',
      right: 0,
      top: 4,
    },
    datePickerDoneButton: {
      marginTop: spacing.sm,
      alignSelf: 'stretch',
    },
    actionsContainer: {
      marginTop: spacing.xl,
      gap: spacing.md,
    },
    userAvatar: {
      alignSelf: 'center',
      marginBottom: spacing.lg,
    },
    formContent: {
      gap: spacing.sm,
    },
    actionButton: {
      width: '100%',
    },
  });
