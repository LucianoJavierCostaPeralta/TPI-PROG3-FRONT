import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, useColorScheme } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { createAppTheme } from './src/styles/theme';
import { handleAuthCallbackUrl, type AuthCallbackRoute } from './src/lib/authLinks';

export default function App() {
  const colorScheme = useColorScheme();
  const theme = createAppTheme(colorScheme === 'dark');
  const navigationRef = useNavigationContainerRef();
  const [pendingRoute, setPendingRoute] = useState<AuthCallbackRoute | null>(null);

  const resetToRoute = useCallback(
    (route: AuthCallbackRoute) => {
      if (!navigationRef.isReady()) {
        setPendingRoute(route);
        return;
      }

      navigationRef.resetRoot({
        index: 0,
        routes: [{ name: route }],
      });
    },
    [navigationRef],
  );

  useEffect(() => {
    const openAuthUrl = async (url: string | null) => {
      if (!url) {
        return;
      }

      try {
        const route = await handleAuthCallbackUrl(url);

        if (route) {
          resetToRoute(route);
        }
      } catch (error) {
        Alert.alert(
          'Enlace inválido',
          'No se pudo abrir el enlace de autenticación. Solicitá un correo nuevo e intentá nuevamente.',
        );
      }
    };

    void Linking.getInitialURL().then(openAuthUrl);

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void openAuthUrl(url);
    });

    return () => subscription.remove();
  }, [resetToRoute]);

  const handleNavigationReady = () => {
    if (pendingRoute) {
      navigationRef.resetRoot({
        index: 0,
        routes: [{ name: pendingRoute }],
      });
      setPendingRoute(null);
    }
  };

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer ref={navigationRef} onReady={handleNavigationReady}>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
