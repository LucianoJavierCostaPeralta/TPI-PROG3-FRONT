import { LoginTemplate } from '../components/templates/LoginTemplate';
import { LoginHeader } from '../components/organisms/LoginHeader';
import { LoginForm } from '../components/molecules/LoginForm';
import { RegisterFooter } from '../components/molecules/RegisterFooter';

type LoginScreenProps = {
  navigation?: {
    navigate: (screen: string) => void;
  };
};

export function LoginScreen({ navigation }: LoginScreenProps) {
  const handleLogin = (email: string, password: string) => {
    console.log('Login:', { email, password });
  };

  const handleForgotPassword = () => {
    console.log('Forgot password');
  };

  const handleConsultWithAdvisor = () => {
    navigation?.navigate('RegisterScreen');
  };

  return (
    <LoginTemplate
      title="Iniciar Sesión"
      subtitle="Ingrese sus credenciales para acceder a la plataforma"
    >
      <LoginHeader onForgotPassword={handleForgotPassword} />
      <LoginForm onSubmit={handleLogin} />
      <RegisterFooter onConsultWithAdvisor={handleConsultWithAdvisor} />
    </LoginTemplate>
  );
}
