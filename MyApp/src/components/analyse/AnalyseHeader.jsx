import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme/ThemeContext';

/**
 * Header component for AnalyseScreen with close button
 */
export default function AnalyseHeader({
  productName,
  scanTime,
  ratingColor,
  onClose,
  style,
}) {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.statusPill, { backgroundColor: ratingColor }]}>
        <Ionicons name="checkmark" size={20} color={colors.background} />
      </View>

      <View style={styles.textBlock}>
        <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
          {productName}
        </Text>
        <Text style={[styles.meta, { color: colors.muted }]}>{scanTime}</Text>
      </View>

      <Pressable onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.surface }]}>
        <Ionicons name="close" size={18} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
