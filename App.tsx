import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { createAppTheme } from './src/styles/theme';

export default function App() {
  const colorScheme = useColorScheme();
  const theme = createAppTheme(colorScheme === 'dark');

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
