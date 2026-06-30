import { configureStore } from '@reduxjs/toolkit';
import { temaReducer } from './slices/temaSlice';

export const store = configureStore({
  reducer: {
    tema: temaReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
