import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme/ThemeContext';

/**
 * Empty state component for History screen
 */
export default function HistoryEmptyState({ style }) {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name="time-outline" size={48} color={colors.muted} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>No scans yet</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Use the Scanner tab to scan barcodes or ingredient lists.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 48,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
