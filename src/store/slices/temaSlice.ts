import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ColorSchemeName } from 'react-native';

export type ModoTema = 'sistema' | 'claro' | 'oscuro';
export type TemaResuelto = 'claro' | 'oscuro';

type TemaState = {
  modo: ModoTema;
};

const initialState: TemaState = {
  modo: 'sistema',
};

const temaSlice = createSlice({
  name: 'tema',
  initialState,
  reducers: {
    setModoTema(state, action: PayloadAction<ModoTema>) {
      state.modo = action.payload;
    },
  },
});

export const { setModoTema } = temaSlice.actions;
export const temaReducer = temaSlice.reducer;

export function resolverTema(modo: ModoTema, colorScheme: ColorSchemeName): TemaResuelto {
  if (modo === 'claro' || modo === 'oscuro') {
    return modo;
  }

  return colorScheme === 'dark' ? 'oscuro' : 'claro';
}

export function isModoTema(value: string | null): value is ModoTema {
  return value === 'sistema' || value === 'claro' || value === 'oscuro';
}
