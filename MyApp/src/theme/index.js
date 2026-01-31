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
  xl: 18,
  pill: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const typography = {
  title: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: lightColors.text, 
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: { 
    fontSize: 16, 
    fontWeight: '500',
    color: lightColors.textSecondary, 
    textAlign: 'center',
    lineHeight: 22,
  },
  body: { 
    fontSize: 14, 
    fontWeight: '400',
    color: lightColors.text, 
    textAlign: 'left',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: lightColors.muted,
    lineHeight: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
};

export const theme = {
  colors: lightColors,
  spacing,
  radius,
  typography,
  shadows,
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
