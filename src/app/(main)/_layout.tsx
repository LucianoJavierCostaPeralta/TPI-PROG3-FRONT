import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" options={{ animation: 'slide_from_right', animationDuration: 300, gestureEnabled: false }} />
      <Stack.Screen name="contactar-asesor" options={{ animation: "slide_from_right", animationDuration: 300 }} />
      <Stack.Screen name="configuracion" options={{ animation: 'slide_from_right', animationDuration: 300 }} />
      <Stack.Screen name="perfil" options={{ animation: 'slide_from_right', animationDuration: 300 }} />
      <Stack.Screen name="editar-perfil" options={{ animation: 'slide_from_right', animationDuration: 300 }} />
      <Stack.Screen name="legal" options={{ animation: 'slide_from_right', animationDuration: 300 }} />
    </Stack>
  );
}
