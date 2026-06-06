import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// Paleta de colores corporativa profesional
export const palette = {
  // Azules corporativos
  primaryBlue: '#1976D2',
  lightBlue: '#64B5F6',
  
  // Grises corporativos
  darkGray: '#333333',
  mediumGray: '#666666',
  lightGray: '#F5F5F5',
  
  // Neutrales y especiales
  white: '#FFFFFF',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Grises adicionales para transiciones
  neutral900: '#0F172A',
  neutral800: '#111827',
  neutral700: '#334155',
  neutral600: '#4B5563',
  neutral500: '#64748B',
  neutral400: '#94A3B8',
  neutral300: '#CBD5E1',
  neutral200: '#E5E7EB',
  neutral100: '#F1F5F9',
  neutral50: '#F8FAFC',
  black: '#000000',
  whiteAlpha30: 'rgba(255, 255, 255, 0.3)',
  whiteAlpha80: 'rgba(255, 255, 255, 0.8)',
  whiteAlpha90: 'rgba(255, 255, 255, 0.9)',
  blackAlpha20: 'rgba(0, 0, 0, 0.2)',
};

// Tipografía moderna y legible
export const typography = {
  // Títulos grandes en negrita
  headlineLg: {
    fontSize: 32,
    fontWeight: '800' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  // Títulos medianos
  headlineMd: {
    fontSize: 28,
    fontWeight: '800' as const,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  // Títulos pequeños
  headlineSm: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  // Texto corporal grande
  bodyLg: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  // Texto corporal normal
  bodyMd: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  // Texto pequeño
  bodySm: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  // Labels y pequeños detalles
  labelSm: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
};

// Espaciado uniforme
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Estilos de botones
export const buttonStyles = {
  primary: {
    height: 54,
    borderRadius: 12,
    backgroundColor: palette.primaryBlue,
    paddingHorizontal: spacing.xl,
  },
  outline: {
    height: 50,
    borderRadius: 12,
    backgroundColor: palette.white,
    borderWidth: 2,
    borderColor: palette.primaryBlue,
    paddingHorizontal: spacing.xl,
  },
  small: {
    height: 42,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
  },
};

// Estilos de cards
export const cardStyles = {
  base: {
    borderRadius: 14,
    backgroundColor: palette.lightGray,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: palette.neutral300,
  },
  elevated: {
    borderRadius: 12,
    backgroundColor: palette.white,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.neutral200,
    shadowColor: palette.black,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
};

const lightColors = {
  primary: palette.primaryBlue,
  onPrimary: palette.white,
  secondary: palette.lightBlue,
  background: palette.white,
  surface: palette.lightGray,
  surfaceVariant: palette.neutral100,
  outline: palette.neutral300,
  onSurface: palette.darkGray,
  onSurfaceVariant: palette.mediumGray,
  error: palette.error,
  onError: palette.white,
};

const darkColors = {
  primary: palette.lightBlue,
  onPrimary: palette.darkGray,
  secondary: palette.primaryBlue,
  background: palette.neutral900,
  surface: palette.neutral800,
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
