import { useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';

import { HomeScreen } from './src/screens/HomeScreen';
import { createAppTheme } from './src/styles/theme';

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = createAppTheme(isDark);

  return (
    <PaperProvider
      theme={theme}
      settings={{
        icon: (props) => <MaterialCommunityIcons {...props} />,
      }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <HomeScreen />
    </PaperProvider>
  );
}
