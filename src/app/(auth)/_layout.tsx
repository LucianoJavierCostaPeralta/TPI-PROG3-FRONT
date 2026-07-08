import { Stack } from 'expo-router';
import { useTheme, type MD3Theme } from 'react-native-paper';

export default () => {
  const theme = useTheme<MD3Theme>();

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
            backgroundColor: theme.colors.backdrop,
          },
        }}
      />
      <Stack.Screen name="reset-password" options={{ animation: 'slide_from_right', animationDuration: 300, gestureEnabled: false }} />
    </Stack>
  );
};
