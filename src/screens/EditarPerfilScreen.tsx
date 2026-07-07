import { EditarPerfilTemplate } from '../components/templates';
import { useEditProfile } from '../hooks/profile/useEditProfile';

type EditarPerfilScreenProps = {
  onBack: () => void;
  onSaveSuccess: () => void;
};

export function EditarPerfilScreen({ onBack, onSaveSuccess }: EditarPerfilScreenProps) {
  const profile = useEditProfile({ onBack, onSaveSuccess });

  return (
    <EditarPerfilTemplate
      error={profile.error}
      form={profile.form}
      formErrors={profile.formErrors}
      isChofer={profile.isChofer}
      loading={profile.loading}
      saving={profile.saving}
      selectedImageUri={profile.selectedImageUri}
      user={profile.user}
      onBack={onBack}
      onCancel={onBack}
      onLoadProfile={profile.loadProfileData}
      onPickImage={profile.pickImage}
      onSave={profile.handleSave}
      onChangeField={profile.handleInputChange}
    />
  );
}
