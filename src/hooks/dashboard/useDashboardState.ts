import { useDashboardFormState } from './useDashboardFormState';
import { useDashboardUiState } from './useDashboardUiState';

export const useDashboardState = () => {
  const uiState = useDashboardUiState();
  const formState = useDashboardFormState();

  return {
    ...uiState,
    ...formState,
  };
};
