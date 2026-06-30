import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { createAppTheme } from '../styles/theme';
import { useAppDispatch, useAppSelector } from './hooks';
import { isModoTema, resolverTema, setModoTema } from './slices/temaSlice';
import { store } from './store';

const STORAGE_KEY = 'zonescore:tema';

function ThemedPaperProvider({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const modoTema = useAppSelector((state) => state.tema.modo);
  const temaResuelto = resolverTema(modoTema, colorScheme);

  useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEY).then((storedMode) => {
      if (isModoTema(storedMode)) {
        dispatch(setModoTema(storedMode));
      }
    });
  }, [dispatch]);

  const paperTheme = useMemo(
    () => createAppTheme(temaResuelto === 'oscuro'),
    [temaResuelto],
  );

  return <PaperProvider theme={paperTheme}>{children}</PaperProvider>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemedPaperProvider>{children}</ThemedPaperProvider>
    </Provider>
  );
}

export { STORAGE_KEY as TEMA_STORAGE_KEY };
