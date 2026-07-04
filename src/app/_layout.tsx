import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProviders } from '../store/AppProviders';
import { palette } from '../styles/theme';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AppProviders>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ animation: 'none' }} />
          <Stack.Screen name="onboarding1" options={{ animation: 'fade', animationDuration: 600 }} />
          <Stack.Screen name="onboarding2" options={{ animation: 'slide_from_right', animationDuration: 500 }} />
          <Stack.Screen name="login" options={{ animation: 'slide_from_bottom', animationDuration: 400 }} />
          <Stack.Screen
            name="register"
            options={{
              presentation: 'modal',
              animation: 'fade_from_bottom',
              animationDuration: 350,
              gestureEnabled: true,
              gestureDirection: 'vertical',
              contentStyle: {
                backgroundColor: palette.blackAlpha20,
              },
            }}
          />
          <Stack.Screen name="reset-password" options={{ animation: 'slide_from_right', animationDuration: 300, gestureEnabled: false }} />
          <Stack.Screen name="home" options={{ animation: 'slide_from_right', animationDuration: 300, gestureEnabled: false }} />
          <Stack.Screen name="configuracion" options={{ animation: 'slide_from_right', animationDuration: 300 }} />
          <Stack.Screen name="perfil" options={{ animation: 'slide_from_right', animationDuration: 300 }} />
          <Stack.Screen name="editar-perfil" options={{ animation: 'slide_from_right', animationDuration: 300 }} />
        </Stack>
      </AppProviders>
    </SafeAreaProvider>
  );
}
