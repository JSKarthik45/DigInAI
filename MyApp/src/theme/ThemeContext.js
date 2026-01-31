import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from './colors';

const ThemeContext = createContext({ 
  colors: lightColors, 
  scheme: 'light',
  isDark: false,
});

export function ThemeProvider({ children }) {
  const scheme = useColorScheme() || 'light';
  const palette = scheme === 'dark' ? darkColors : lightColors;
  
  const value = useMemo(
    () => ({ 
      colors: palette, 
      scheme,
      isDark: scheme === 'dark',
    }), 
    [palette, scheme]
  );
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useThemeColors() {
  const ctx = useContext(ThemeContext);
  return ctx.colors;
}

export function useThemedStyles(factory) {
  const { colors } = useContext(ThemeContext);
  return useMemo(() => factory(colors), [factory, colors]);
}
