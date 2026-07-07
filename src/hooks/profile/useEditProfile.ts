import { useCallback, useEffect, useState } from 'react';
import { BackHandler, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getProfile, updateProfile, type AuthUser } from '../../services/api';
import { saveProfileImageUri } from '../../services/profileImage';
import {
  formatProfileDateForInput,
  initialEditProfileForm,
  parseProfileDate,
  type EditProfileFormErrors,
  type EditProfileFormFields,
  validateEditProfileForm,
} from '../../utils/profile/editProfile';

export type UseEditProfileParams = {
  onBack: () => void;
  onSaveSuccess: () => void;
};

export function useEditProfile({ onBack, onSaveSuccess }: UseEditProfileParams) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<EditProfileFormErrors>({});
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [form, setForm] = useState<EditProfileFormFields>(initialEditProfileForm);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const isChofer = user?.rol?.nombre_rol?.toLowerCase() === 'chofer';
  const selectedDate = parseProfileDate(form.fecha_nacimiento);

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
      setSelectedImageUri(null);
      setFormErrors({});
    } catch {
      setError('No se pudo cargar la información del perfil.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfileData();
  }, [loadProfileData]);

  useEffect(() => {
    const handleBack = () => {
      onBack();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => subscription.remove();
  }, [onBack]);

  const handleInputChange = useCallback((field: keyof EditProfileFormFields, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => {
      if (!current[field]) return current;
      return { ...current, [field]: undefined };
    });
  }, []);

  const pickImage = useCallback(async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      setError('Se necesita permiso para elegir una foto de perfil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setSelectedImageUri(result.assets[0].uri);
      await saveProfileImageUri(result.assets[0].uri);
      setError('');
    }
  }, []);

  const handleDateChange = useCallback((_event: unknown, date?: Date) => {
    if (Platform.OS === 'android') {
      setDatePickerVisible(false);
    }

    if (date) {
      handleInputChange('fecha_nacimiento', formatProfileDateForInput(date));
    }
  }, [handleInputChange]);

  const handleSave = useCallback(async () => {
    const nextErrors = validateEditProfileForm(form, !!isChofer);
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !user) return;

    setSaving(true);
    setError('');

    try {
      if (selectedImageUri) {
        await saveProfileImageUri(selectedImageUri);
      }

      await updateProfile(user.id, user.rol?.nombre_rol || '', {
        nombre_completo: form.nombre_completo.trim(),
        email: form.email.trim().toLowerCase(),
        telefono: form.telefono.trim() || null,
        fecha_nacimiento: isChofer ? (form.fecha_nacimiento.trim() || null) : null,
      });

      onSaveSuccess();
    } catch {
      setError('No se pudo guardar los cambios. Revisa los datos ingresados.');
    } finally {
      setSaving(false);
    }
  }, [form, isChofer, onSaveSuccess, selectedImageUri, user]);

  return {
    datePickerVisible,
    error,
    form,
    formErrors,
    handleDateChange,
    handleInputChange,
    handleSave,
    isChofer,
    loadProfileData,
    loading,
    pickImage,
    saving,
    selectedDate,
    selectedImageUri,
    setDatePickerVisible,
    user,
  };
}
