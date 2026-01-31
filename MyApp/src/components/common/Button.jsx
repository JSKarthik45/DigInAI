import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useThemeColors } from '../../theme/ThemeContext';

/**
 * Reusable Button component with multiple variants
 */
export default function Button({
  onPress,
  title,
  variant = 'primary', // 'primary' | 'secondary' | 'tertiary' | 'ghost'
  size = 'medium', // 'small' | 'medium' | 'large'
  loading = false,
  disabled = false,
  icon = null,
  style,
  textStyle,
}) {
  const colors = useThemeColors();

  const sizeStyles = {
    small: { paddingVertical: 6, paddingHorizontal: 12 },
    medium: { paddingVertical: 10, paddingHorizontal: 20 },
    large: { paddingVertical: 14, paddingHorizontal: 28 },
  };

  const fontSizes = {
    small: 12,
    medium: 14,
    large: 16,
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.muted;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.background;
      case 'tertiary':
      case 'ghost':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.background;
    switch (variant) {
      case 'primary':
        return colors.background;
      case 'secondary':
        return colors.primary;
      case 'tertiary':
      case 'ghost':
        return colors.primary;
      default:
        return colors.background;
    }
  };

  const getBorderStyle = () => {
    if (variant === 'secondary') {
      return {
        borderWidth: 1,
        borderColor: colors.primary,
      };
    }
    return {};
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        { backgroundColor: getBackgroundColor() },
        getBorderStyle(),
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              { color: getTextColor(), fontSize: fontSizes[size] },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    gap: 8,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
