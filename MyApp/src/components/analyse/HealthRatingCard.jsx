import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme/ThemeContext';

/**
 * Health rating card with score and progress bar
 */
export default function HealthRatingCard({
  score = 0,
  label = 'Good',
  backgroundColor,
  style,
}) {
  const colors = useThemeColors();
  const bgColor = backgroundColor || colors.success;
  
  const getMessage = () => {
    if (score >= 85) return 'This product looks good';
    if (score >= 70) return 'Some concerns';
    if (score >= 50) return 'Exercise caution';
    return 'High risk — avoid if possible';
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }, style]}>
      <Text style={[styles.label, { color: colors.background }]}>
        {`OVERALL HEALTH RATING: ${label.toUpperCase()}`}
      </Text>
      <View style={styles.scoreRow}>
        <Text style={[styles.scorePrimary, { color: colors.background }]}>
          {String(score)}
        </Text>
        <Text style={[styles.scoreSecondary, { color: colors.background }]}>
          /100
        </Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.background }]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${Math.max(0, Math.min(100, score))}%`,
              backgroundColor: colors.text,
            }
          ]} 
        />
      </View>
      <Text style={[styles.message, { color: colors.background }]}>
        {getMessage()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scorePrimary: {
    fontSize: 40,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 44,
  },
  scoreSecondary: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 4,
    opacity: 0.9,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
  },
  message: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
});
