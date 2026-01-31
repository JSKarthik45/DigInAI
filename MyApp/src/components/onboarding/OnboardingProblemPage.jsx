import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useThemeColors } from '../../theme/ThemeContext';

const ICONS = [
  { name: 'flask', color: '#f97316', left: 16, top: 40 },
  { name: 'vial', color: '#22c55e', right: 24, top: 120 },
  { name: 'radiation-alt', color: '#eab308', centerX: true, top: 20 },
  { name: 'skull-crossbones', color: '#ef4444', left: '25%', top: 200 },
  { name: 'biohazard', color: '#a855f7', left: 102, bottom: 200 },
  { name: 'prescription-bottle-alt', color: '#0ea5e9', right: 36, bottom: 220 },
  { name: 'capsules', color: '#f97316', right: 100, top: 260 },
  { name: 'atom', color: '#38bdf8', left: 60, top: 300 },
];

export default function OnboardingProblemPage({ floatA, floatB, width, style }) {
  const colors = useThemeColors();
  
  const floatUpDownA = floatA.interpolate({ inputRange: [0, 1], outputRange: [6, -6] });
  const floatUpDownB = floatB.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] });

  return (
    <View style={[styles.page, { width, backgroundColor: colors.background }, style]}>
      <Text style={[styles.title, { color: colors.primary }]}>
        Trusting labels blindly?
      </Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        It's impossible to memorize every preservative. Hidden nasties often slip into your cart unnoticed.
      </Text>
      <View style={styles.iconsContainer} pointerEvents="none">
        {ICONS.map((icon, index) => {
          const animValue = index % 2 === 0 ? floatUpDownA : floatUpDownB;
          const positionStyle = {
            position: 'absolute',
            ...(icon.left !== undefined && { left: icon.left }),
            ...(icon.right !== undefined && { right: icon.right }),
            ...(icon.top !== undefined && { top: icon.top }),
            ...(icon.bottom !== undefined && { bottom: icon.bottom }),
            ...(icon.centerX && { left: width / 2 - 18 }),
          };
          
          return (
            <Animated.View 
              key={icon.name + index} 
              style={[positionStyle, { transform: [{ translateY: animValue }] }]}
            >
              <FontAwesome5 name={icon.name} size={36} color={icon.color} />
            </Animated.View>
          );
        })}
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
  iconsContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
