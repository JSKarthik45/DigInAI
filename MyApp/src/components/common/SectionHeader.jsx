import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme/ThemeContext';

/**
 * Reusable section header component
 */
export default function SectionHeader({ 
  title, 
  subtitle,
  rightElement,
  style 
}) {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>
        )}
      </View>
      {rightElement}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
