const spacing = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 18,
};

const radii = {
  md: 8,
};

const sizes = {
  selectHeight: 40,
};

const typography = {
  h1: {
    fontSize: 16 as const,
    lineHeight: 19 as const,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: 24 as const,
    lineHeight: 29 as const,
    fontWeight: '700' as const,
  },
  h3: {
    fontSize: 20 as const,
    lineHeight: 26 as const,
    fontWeight: '600' as const,
  },
  h4: {
    fontSize: 18 as const,
    lineHeight: 23 as const,
    fontWeight: '600' as const,
  },
  h5: {
    fontSize: 16 as const,
    lineHeight: 22 as const,
    fontWeight: '600' as const,
  },
  h6: {
    fontSize: 14 as const,
    lineHeight: 20 as const,
    fontWeight: '600' as const,
  },
  bodyLarge: {
    fontSize: 16 as const,
    lineHeight: 26 as const,
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 14 as const,
    lineHeight: 22 as const,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 13 as const,
    lineHeight: 20 as const,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12 as const,
    lineHeight: 17 as const,
    fontWeight: '400' as const,
  },
  overline: {
    fontSize: 11 as const,
    lineHeight: 15 as const,
    fontWeight: '600' as const,
  },
  buttonLarge: {
    fontSize: 16 as const,
    lineHeight: 16 as const,
    fontWeight: '600' as const,
  },
  button: {
    fontSize: 14 as const,
    lineHeight: 14 as const,
    fontWeight: '600' as const,
  },
  input: {
    fontSize: 16 as const,
    lineHeight: 22 as const,
    fontWeight: '400' as const,
  },
  tabLabel: {
    fontSize: 10 as const,
    lineHeight: 14 as const,
    fontWeight: '600' as const,
  },
};

const lightColors = {
  appBackground: '#e5e7eb',
  surface: '#ffffff',
  surfaceSoft: '#f8fafc',
  surfaceMuted: '#f3f4f6',
  topBar: '#efefef',
  border: '#d1d5db',
  textPrimary: '#1f2937',
  textSecondary: '#4b5563',
  textMuted: '#9ca3af',
};

const darkColors = {
  appBackground: '#0f172a',
  surface: '#111827',
  surfaceSoft: '#1f2937',
  surfaceMuted: '#374151',
  topBar: '#1f2937',
  border: '#374151',
  textPrimary: '#f9fafb',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',
};

export const lightTheme = {
  mode: 'light' as const,
  colors: lightColors,
  spacing,
  radii,
  sizes,
  typography,
};

export const darkTheme = {
  mode: 'dark' as const,
  colors: darkColors,
  spacing,
  radii,
  sizes,
  typography,
};

export type AppTheme = typeof lightTheme | typeof darkTheme;
