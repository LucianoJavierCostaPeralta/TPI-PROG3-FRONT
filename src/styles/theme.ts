import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { commonColors, darkTheme, lightTheme, neutralColors } from '../constants/colors';

export const palette = {
  ...commonColors,
  ...neutralColors,
  primaryBlue: commonColors.primary,
  lightBlue: '#54A8FF',
  darkGray: neutralColors.neutral900,
  mediumGray: neutralColors.neutral600,
  lightGray: neutralColors.neutral50,
};

export const typography = {
  headlineLg: {
    fontSize: 32,
    fontWeight: '800' as const,
    lineHeight: 40,
    letterSpacing: 0,
  },
  headlineMd: {
    fontSize: 28,
    fontWeight: '800' as const,
    lineHeight: 36,
    letterSpacing: 0,
  },
  headlineSm: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    letterSpacing: 0,
  },
  bodyLg: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyMd: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: 0,
  },
  bodySm: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  labelMd: {
    fontSize: 13,
    fontWeight: '700' as const,
    lineHeight: 18,
    letterSpacing: 0,
  },
  labelSm: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
    letterSpacing: 0,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radii = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
};

export const buttonStyles = {
  primary: {
    height: 48,
    borderRadius: radii.md,
    backgroundColor: commonColors.primary,
    paddingHorizontal: spacing.xl,
  },
  outline: {
    height: 48,
    borderRadius: radii.md,
    backgroundColor: commonColors.white,
    borderWidth: 1.5,
    borderColor: commonColors.primary,
    paddingHorizontal: spacing.xl,
  },
  destructive: {
    height: 48,
    borderRadius: radii.md,
    backgroundColor: commonColors.error,
    paddingHorizontal: spacing.xl,
  },
  small: {
    height: 40,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
  },
};

export const inputStyles = {
  height: 52,
  borderRadius: radii.md,
  borderWidth: 1.5,
  paddingHorizontal: spacing.md,
};

export const cardStyles = {
  base: {
    borderRadius: radii.md,
    backgroundColor: lightTheme.surface,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: lightTheme.outline,
  },
  elevated: {
    borderRadius: radii.md,
    backgroundColor: lightTheme.surface,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: neutralColors.neutral200,
    shadowColor: commonColors.black,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const statusStyles = {
  assigned: {
    backgroundColor: '#E8F8EF',
    color: '#087A3D',
    borderColor: '#B8EBCB',
  },
  onWay: {
    backgroundColor: '#EAF3FF',
    color: '#075DB6',
    borderColor: '#B9D9FF',
  },
  pending: {
    backgroundColor: '#FFF4E4',
    color: '#A45A00',
    borderColor: '#FFD8A3',
  },
  error: {
    backgroundColor: '#FFE8EB',
    color: '#B51025',
    borderColor: '#FFB8C1',
  },
};

export const appColors = {
  light: lightTheme,
  dark: darkTheme,
  status: {
    success: commonColors.success,
    warning: commonColors.warning,
    error: commonColors.error,
    info: commonColors.info,
  },
};

function mapToPaperColors(colors: typeof lightTheme) {
  return {
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    outline: colors.outline,
    onSurface: colors.text,
    onSurfaceVariant: colors.textMuted,
    error: colors.error,
    onError: colors.onError,
    onBackground: colors.text,
  };
}

export function createAppTheme(isDark: boolean) {
  const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;
  const colors = isDark ? darkTheme : lightTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      ...mapToPaperColors(colors),
    },
  };
}
