import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme/ThemeContext';

/**
 * Card showing flagged colour additive details
 */
export default function FlaggedColourCard({
  code,
  properName,
  commonName,
  bannedCountries,
  warningCountries,
  explanation,
  style,
}) {
  const colors = useThemeColors();
  const hasBanned = !!bannedCountries;
  const hasWarning = !!warningCountries;

  const titleText = properName && commonName
    ? `${code} ${properName} (${commonName})`
    : `${code} ${properName || commonName || ''}`.trim();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }, style]}>
      <View style={styles.header}>
        {hasBanned && (
          <Ionicons name="alert-circle" size={18} color="#ff3b30" />
        )}
        {hasWarning && (
          <Ionicons 
            name="warning" 
            size={18} 
            color={colors.warning} 
            style={{ marginLeft: hasBanned ? 8 : 0 }} 
          />
        )}
        <Text style={[styles.title, { color: colors.text }]}>{titleText}</Text>
      </View>
      {hasBanned && (
        <Text style={[styles.meta, { color: colors.text }]}>
          Banned in: {bannedCountries}
        </Text>
      )}
      {hasWarning && (
        <Text style={[styles.meta, { color: colors.text }]}>
          Warning in: {warningCountries}
        </Text>
      )}
      {explanation && (
        <Text style={[styles.description, { color: colors.muted }]}>
          {explanation}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 6,
    flex: 1,
  },
  meta: {
    fontSize: 11,
    marginTop: 4,
  },
  description: {
    fontSize: 12,
    marginTop: 6,
  },
});
