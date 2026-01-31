import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme/ThemeContext';

/**
 * Reusable Card component with consistent styling
 */
export default function Card({ 
  children, 
  style, 
  variant = 'default', // 'default' | 'outlined' | 'plain'
  padding = 14,
  borderRadius = 16,
}) {
  const colors = useThemeColors();
  
  const cardStyles = [
    styles.base,
    { 
      padding,
      borderRadius,
      backgroundColor: variant === 'plain' ? 'transparent' : colors.surface,
    },
    variant === 'outlined' && {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    style,
  ];

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    marginBottom: 16,
  },
});
