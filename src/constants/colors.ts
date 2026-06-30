export const commonColors = {
  primary: '#0875E1',
  primaryHover: '#0067CC',
  secondary: '#2388F2',
  success: '#09C46B',
  warning: '#FF9F2E',
  error: '#FF334B',
  info: '#2388F2',
  white: '#FFFFFF',
  black: '#000000',
  whiteAlpha30: 'rgba(255, 255, 255, 0.3)',
  whiteAlpha80: 'rgba(255, 255, 255, 0.8)',
  whiteAlpha90: 'rgba(255, 255, 255, 0.9)',
  blackAlpha20: 'rgba(0, 0, 0, 0.2)',
};

export const neutralColors = {
  neutral900: '#0B1220',
  neutral800: '#1E293B',
  neutral700: '#334155',
  neutral600: '#64748B',
  neutral500: '#94A3B8',
  neutral400: '#CBD5E1',
  neutral300: '#D8E0EA',
  neutral200: '#E7ECF2',
  neutral100: '#F1F5F9',
  neutral50: '#F8FAFC',
};

export const lightTheme = {
  ...commonColors,
  ...neutralColors,
  background: neutralColors.neutral50,
  surface: commonColors.white,
  surfaceVariant: neutralColors.neutral100,
  outline: neutralColors.neutral300,
  text: neutralColors.neutral900,
  textMuted: neutralColors.neutral600,
  disabled: neutralColors.neutral200,
  onDisabled: neutralColors.neutral500,
  onPrimary: commonColors.white,
  onError: commonColors.white,
};

export const darkTheme = {
  ...commonColors,
  ...neutralColors,
  primary: '#54A8FF',
  primaryHover: '#7BBCFF',
  background: neutralColors.neutral900,
  surface: neutralColors.neutral800,
  surfaceVariant: neutralColors.neutral700,
  outline: neutralColors.neutral600,
  text: neutralColors.neutral50,
  textMuted: neutralColors.neutral300,
  disabled: neutralColors.neutral700,
  onDisabled: neutralColors.neutral500,
  onPrimary: neutralColors.neutral900,
  onError: commonColors.white,
};

export type AppColorTheme = typeof lightTheme;
