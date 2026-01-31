import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme/ThemeContext';

/**
 * Large circular scan button
 */
export default function ScanButton({ 
  mode = 'barcode',
  onPress,
  size = 220,
  style 
}) {
  const colors = useThemeColors();
  const icon = mode === 'barcode' ? 'scan' : 'document-text';

  return (
    <Pressable 
      style={[styles.button, { width: size, height: size, borderRadius: size / 2 }, style]} 
      onPress={onPress}
    >
      <View 
        pointerEvents="none" 
        style={[
          StyleSheet.absoluteFillObject, 
          { backgroundColor: colors.primary, borderRadius: size / 2 }
        ]} 
      />
      <View style={styles.content}>
        <Ionicons name={icon} size={76} color={colors.background} />
        <Text style={[styles.text, { color: colors.background }]}>TAP TO SCAN</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  content: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
