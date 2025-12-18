import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from './colors';

const ThemeContext = createContext({ colors: lightColors, scheme: 'light' });

export function ThemeProvider({ children }) {
  const scheme = useColorScheme() || 'light';
  const palette = scheme === 'dark' ? darkColors : lightColors;
  const value = useMemo(() => ({ colors: palette, scheme }), [palette, scheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeColors() {
  const ctx = useContext(ThemeContext);
  return ctx.colors;
}

export function useThemedStyles(factory) {
  const palette = useThemeColors();
  return useMemo(() => factory(palette), [factory, palette]);
}
