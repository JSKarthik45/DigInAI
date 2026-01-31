import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme/ThemeContext';

/**
 * Help hints shown at top of history screen
 */
export default function HistoryHints({ style }) {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <Ionicons name="hand-left-outline" size={16} color={colors.muted} />
        <Text style={[styles.text, { color: colors.muted }]}>Tap an item for details</Text>
      </View>
      <View style={[styles.row, styles.rowSpaced]}>
        <Ionicons name="arrow-back-outline" size={16} color={colors.muted} />
        <Text style={[styles.text, { color: colors.muted }]}>Swipe left to delete</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSpaced: {
    marginTop: 8,
  },
  text: {
    fontSize: 14,
    marginLeft: 8,
  },
});
