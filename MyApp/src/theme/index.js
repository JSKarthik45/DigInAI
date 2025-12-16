import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { lightColors, darkColors } from './colors';

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
  title: { fontSize: 20, fontWeight: '700', color: lightColors.text, textAlign: 'center' },
  subtitle: { fontSize: 16, color: lightColors.text, textAlign: 'center' },
  body: { fontSize: 14, color: lightColors.text, textAlign: 'left' },
};

export const theme = {
  colors: lightColors,
  spacing,
  radius,
  typography,
};

export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: lightColors.background,
    card: lightColors.surface,
    text: lightColors.text,
    border: lightColors.border,
    primary: lightColors.primary,
  },
};
export const darkNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: darkColors.background,
    card: darkColors.surface,
    text: darkColors.text,
    border: darkColors.border,
    primary: darkColors.primary,
  },
};
export const colors = lightColors;

export { lightColors, darkColors };
