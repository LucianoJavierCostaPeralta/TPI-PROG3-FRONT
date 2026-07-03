export function screenToPath(screen: string) {
  switch (screen) {
    case 'SplashScreen':
      return '/';
    case 'Onboarding1':
      return '/onboarding1';
    case 'Onboarding2':
      return '/onboarding2';
    case 'LoginScreen':
      return '/login';
    case 'RegisterScreen':
      return '/register';
    case 'ResetPasswordScreen':
      return '/reset-password';
    case 'HomeScreen':
      return '/home';
    case 'PerfilScreen':
      return '/perfil';
    case 'EditarPerfilScreen':
      return '/editar-perfil';
    default:
      return '/';
  }
}
