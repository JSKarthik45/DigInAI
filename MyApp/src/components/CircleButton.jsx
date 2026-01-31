import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/ThemeContext';

/**
 * Circular button with icon, commonly used for FAB-style actions
 */
function CircleButton({ 
  onPress, 
  icon = 'arrow-forward', 
  size = 56, 
  backgroundColor, 
  iconColor,
  style,
  disabled = false,
}) {
  const colors = useThemeColors();
  const bg = backgroundColor || colors.primary;
  const iconClr = iconColor || colors.background;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button, 
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2, 
          backgroundColor: disabled ? colors.muted : bg,
        }, 
        style
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={Math.floor(size * 0.48)} color={iconClr} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  iconWrap: { 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
});

export default memo(CircleButton);
