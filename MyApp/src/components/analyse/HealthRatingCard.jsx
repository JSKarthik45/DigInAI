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
    if (score >= 90) return 'Excellent — this product looks clean';
    if (score >= 75) return 'Good — minor concerns only';
    if (score >= 60) return 'Moderate — some ingredients to watch';
    if (score >= 40) return 'Caution — several flagged ingredients';
    if (score >= 20) return 'Poor — multiple harmful additives found';
    return 'Dangerous — avoid this product if possible';
  };

  // White text on all rating backgrounds for contrast
  const textColor = '#ffffff';
  const trackColor = 'rgba(255,255,255,0.3)';
  const fillColor = 'rgba(255,255,255,0.9)';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }, style]}>
      <Text style={[styles.label, { color: textColor }]}>
        {`OVERALL HEALTH RATING: ${label.toUpperCase()}`}
      </Text>
      <View style={styles.scoreRow}>
        <Text style={[styles.scorePrimary, { color: textColor }]}>
          {String(score)}
        </Text>
        <Text style={[styles.scoreSecondary, { color: textColor }]}>
          /100
        </Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: trackColor }]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${Math.max(0, Math.min(100, score))}%`,
              backgroundColor: fillColor,
            }
          ]} 
        />
      </View>
      <Text style={[styles.message, { color: textColor }]}>
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
