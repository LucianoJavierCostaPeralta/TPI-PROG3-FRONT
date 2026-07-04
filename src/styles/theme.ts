import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { commonColors, darkTheme, lightTheme, neutralColors } from '../constants/colors';

export const palette = {
  ...commonColors,
  ...neutralColors,
  primaryBlue: commonColors.primary,
  lightBlue: '#54A8FF',
  googleBlue: '#4285F4',
  googleRed: '#EA4335',
  googleYellow: '#FBBC05',
  googleGreen: '#34A853',
  darkGray: neutralColors.neutral900,
  mediumGray: neutralColors.neutral600,
  lightGray: neutralColors.neutral50,
  avatarPurple: '#9C27B0',
  avatarTeal: '#009688',
  avatarOrange: '#FF5722',
  avatarDeepPurple: '#673AB7',
  avatarIndigo: '#3F51B5',
  brandPurple: '#7652C6',
  successLight: '#E8F8EF',
  infoLight: '#EAF3FF',
  warningLight: '#FFF4E4',
  errorLight: '#FFE8EB',
  successDark: '#15803D',
  successLightBg: '#DCFCE7',
  pendingLightBg: '#FEF3C7',
  infoLightBg: '#DBEAFE',
};

export const typography = {
  headlineLg: {
    fontSize: moderateScale(32),
    fontWeight: '800' as const,
    lineHeight: scale(40),
    letterSpacing: 0,
    fontFamily: 'Inter-Bold',
  },
  headlineMd: {
    fontSize: moderateScale(28),
    fontWeight: '800' as const,
    lineHeight: scale(36),
    letterSpacing: 0,
    fontFamily: 'Inter-Bold',
  },
  headlineSm: {
    fontSize: moderateScale(24),
    fontWeight: '700' as const,
    lineHeight: scale(32),
    letterSpacing: 0,
    fontFamily: 'Inter-SemiBold',
  },
  bodyLg: {
    fontSize: moderateScale(16),
    fontWeight: '500' as const,
    lineHeight: scale(24),
    letterSpacing: 0,
    fontFamily: 'Inter-Medium',
  },
  bodyMd: {
    fontSize: moderateScale(15),
    fontWeight: '400' as const,
    lineHeight: scale(22),
    letterSpacing: 0,
    fontFamily: 'Inter-Regular',
  },
  bodySm: {
    fontSize: moderateScale(14),
    fontWeight: '400' as const,
    lineHeight: scale(20),
    letterSpacing: 0,
    fontFamily: 'Inter-Regular',
  },
  labelMd: {
    fontSize: moderateScale(13),
    fontWeight: '700' as const,
    lineHeight: scale(18),
    letterSpacing: 0,
    fontFamily: 'Inter-SemiBold',
  },
  labelSm: {
    fontSize: moderateScale(12),
    fontWeight: '600' as const,
    lineHeight: scale(16),
    letterSpacing: 0,
    fontFamily: 'Inter-SemiBold',
  },
  caption: {
    fontSize: moderateScale(11),
    fontWeight: '500' as const,
    lineHeight: scale(14),
    letterSpacing: 0,
    fontFamily: 'Inter-Medium',
  },
};

export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(24),
  xxxl: scale(32),
};

export const radii = {
  xs: scale(4),
  sm: scale(6),
  md: scale(8),
  lg: scale(12),
  xl: scale(16),
  '2xl': scale(20),
  '3xl': scale(24),
  pill: 999,
};

export const dimensions = {
  avatar: {
    xs: scale(40),
    sm: scale(42),
    md: scale(48),
    lg: scale(88),
    xl: scale(96),
  },
  icon: {
    sm: scale(50),
    md: scale(60),
  },
  spinner: {
    container: scale(80),
    inner: scale(60),
  },
  minHeight: {
    sm: scale(52),
    md: scale(56),
    lg: scale(250),
  },
  illustration: {
    width: scale(220),
    height: scale(240),
  },
  splash: {
    logoTextSize: scale(48),
    logoSubtitleSize: scale(14),
    logoBottomMargin: scale(60),
    logoOffsetY: scale(30),
    spinnerBottomMargin: scale(40),
    brandRowGap: scale(12),
  },
  dot: scale(10),
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
