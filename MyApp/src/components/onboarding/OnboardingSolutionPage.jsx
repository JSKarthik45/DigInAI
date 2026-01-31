import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme/ThemeContext';

export default function OnboardingSolutionPage({ floatA, floatB, width, style }) {
  const colors = useThemeColors();
  
  const floatUpDownA = floatA.interpolate({ inputRange: [0, 1], outputRange: [6, -6] });
  const floatUpDownB = floatB.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] });

  const icons = [
    { name: 'shield', anim: floatUpDownA, color: colors.primary },
    { name: 'barcode', anim: floatUpDownB, color: colors.primary },
    { name: 'analytics', anim: floatUpDownA, color: colors.text },
    { name: 'search', anim: floatUpDownB, color: colors.muted },
  ];

  return (
    <View style={[styles.page, { width, backgroundColor: colors.background }, style]}>
      <Text style={[styles.title, { color: colors.primary }]}>
        Turn scans into safety checks
      </Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Scan the back, not the front. Get instant insights on synthetic colours and risky additives you should leave on the shelf.
      </Text>
      <View style={styles.iconsRow}>
        {icons.map((icon, index) => (
          <Animated.View 
            key={icon.name} 
            style={{ transform: [{ translateY: icon.anim }] }}
          >
            <Ionicons name={icon.name} size={36} color={icon.color} />
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 90,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
  iconsRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
});
