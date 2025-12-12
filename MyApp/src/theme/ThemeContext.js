import React, { createContext, useContext, useMemo } from 'react';
import { colors as baseColors } from './colors';

const ThemeContext = createContext({ colors: baseColors });

export function ThemeProvider({ children }) {
  const value = useMemo(() => ({ colors: baseColors }), []);
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
