import { RegisterContent, type RegisterSubmission } from '../components/organisms';
import { RegisterTemplate } from '../components/templates';

type RegisterScreenProps = {
  navigation?: {
    navigate: (screen: string) => void;
  };
};

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const handleRegister = (data: RegisterSubmission) => {
    console.log('Register:', data);
    navigation?.navigate('HomeScreen');
  };

  return (
    <RegisterTemplate title="Comience a gestionar su flota">
      <RegisterContent onSubmit={handleRegister} />
    </RegisterTemplate>
  );
}
