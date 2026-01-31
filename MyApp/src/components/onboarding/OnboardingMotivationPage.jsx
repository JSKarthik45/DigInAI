import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme/ThemeContext';

export default function OnboardingMotivationPage({ floatA, floatB, width, style }) {
  const colors = useThemeColors();
  
  const floatUpDownA = floatA.interpolate({ inputRange: [0, 1], outputRange: [6, -6] });
  const floatUpDownB = floatB.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] });

  const icons = [
    { name: 'leaf', anim: floatUpDownA, color: colors.primary },
    { name: 'nutrition', anim: floatUpDownB, color: colors.primary },
    { name: 'heart', anim: floatUpDownA, color: colors.text },
    { name: 'happy', anim: floatUpDownB, color: colors.muted },
  ];

  return (
    <View style={[styles.page, { width, backgroundColor: colors.background }, style]}>
      <Text style={[styles.title, { color: colors.primary }]}>
        Master your grocery list
      </Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Small choices away from processed chemicals, toward cleaner ingredients, lead to stronger health and better habits.
      </Text>
      <View style={styles.iconsRow}>
        {icons.map((icon) => (
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
