import React, { createContext, useContext, useMemo } from 'react';
import { Appearance } from 'react-native';
import { lightColors, darkColors } from './colors';

const getSystemScheme = () => Appearance.getColorScheme?.() || 'light';

const ThemeContext = createContext({ colors: lightColors });

export function ThemeProvider({ children }) {
  const scheme = getSystemScheme();
  const palette = scheme === 'dark' ? darkColors : lightColors;
  const value = useMemo(() => ({ colors: palette }), [palette]);
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
