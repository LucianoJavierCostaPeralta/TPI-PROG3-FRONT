import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { palette } from '../styles/theme';

import { SplashScreen } from '../screens/SplashScreen';
import { Onboarding1 } from '../screens/Onboarding1';
import { Onboarding2 } from '../screens/Onboarding2';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SplashScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Splash Screen - Entrada */}
      <Stack.Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{
          animation: 'none',
        }}
      />

      {/* Onboarding 1 - Fade suave desde Splash */}
      <Stack.Screen
        name="Onboarding1"
        component={Onboarding1}
        options={{
          animation: 'fade',
          animationDuration: 600,
        }}
      />

      {/* Onboarding 2 - Slide horizontal elegante */}
      <Stack.Screen
        name="Onboarding2"
        component={Onboarding2}
        options={{
          animation: 'slide_from_right',
          animationDuration: 500,
        }}
      />

      {/* Login Screen - Slide vertical desde Onboarding */}
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{
          animation: 'slide_from_bottom',
          animationDuration: 400,
        }}
      />

      {/* Register Screen - Modal con fade + scale */}
      <Stack.Screen
        name="RegisterScreen"
        component={RegisterScreen}
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

      <Stack.Screen
        name="ResetPasswordScreen"
        component={ResetPasswordScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 300,
          gestureEnabled: false,
        }}
      />

      {/* Home Screen - Slide horizontal rápido desde Login */}
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 300,
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
