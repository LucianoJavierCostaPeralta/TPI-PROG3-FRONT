import { Stack } from 'expo-router';
import { palette } from '../../styles/theme';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
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
    </Stack>
  );
}
