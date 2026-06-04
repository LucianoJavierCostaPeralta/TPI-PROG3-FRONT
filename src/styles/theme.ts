import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const palette = {
  primary: '#2563EB',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  neutral900: '#0F172A',
  neutral700: '#334155',
  neutral500: '#64748B',
  neutral300: '#CBD5E1',
  neutral100: '#F1F5F9',
  neutral50: '#F8FAFC',
  white: '#FFFFFF',
};

export const typography = {
  headlineLg: {
    fontSize: 32,
    fontWeight: '700' as const,
  },
  headlineMd: {
    fontSize: 24,
    fontWeight: '600' as const,
  },
  headlineSm: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  bodyLg: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  bodyMd: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  labelSm: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
};

const lightColors = {
  primary: palette.primary,
  onPrimary: palette.white,
  secondary: palette.info,
  background: palette.neutral50,
  surface: palette.white,
  surfaceVariant: palette.neutral100,
  outline: palette.neutral300,
  onSurface: palette.neutral900,
  onSurfaceVariant: palette.neutral700,
  error: palette.error,
  onError: palette.white,
};

const darkColors = {
  primary: palette.info,
  onPrimary: palette.white,
  secondary: palette.primary,
  background: palette.neutral900,
  surface: '#111827',
  surfaceVariant: palette.neutral700,
  outline: palette.neutral500,
  onSurface: palette.neutral50,
  onSurfaceVariant: palette.neutral300,
  error: palette.error,
  onError: palette.white,
};

export const appColors = {
  light: lightColors,
  dark: darkColors,
  status: {
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,
  },
};

export function createAppTheme(isDark: boolean) {
  const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;
  const colors = isDark ? appColors.dark : appColors.light;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      ...colors,
      onBackground: colors.onSurface,
    },
  };
}
