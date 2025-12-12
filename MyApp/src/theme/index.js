import { DefaultTheme } from '@react-navigation/native';
import { colors } from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
};

export const typography = {
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 16, color: colors.muted },
  body: { fontSize: 14, color: colors.text },
};

export const theme = {
  colors: colors,
  spacing,
  radius,
  typography,
};

export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

export { colors };
