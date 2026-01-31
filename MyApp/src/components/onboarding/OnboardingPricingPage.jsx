import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme/ThemeContext';

export default function OnboardingPricingPage({ width, style }) {
  const colors = useThemeColors();

  return (
    <View style={[styles.page, { width, backgroundColor: colors.background }, style]}>
      <Text style={[styles.title, { color: colors.primary }]}>Pricing</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Choose the plan that fits your grocery routine — both include a 30 day free trial.
      </Text>
      <View style={styles.plansContainer}>
        <View style={[styles.planCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Text style={[styles.planName, { color: colors.text }]}>Monthly</Text>
          <Text style={[styles.planPrice, { color: colors.text }]}>$4.99</Text>
          <Text style={[styles.planDesc, { color: colors.muted }]}>
            Flexible month-to-month billing.
          </Text>
        </View>
        <View style={[styles.planCard, styles.planCardHighlight, { borderColor: colors.primary, backgroundColor: colors.background }]}>
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: colors.background }]}>BEST VALUE</Text>
          </View>
          <Text style={[styles.planName, { color: colors.text }]}>Yearly</Text>
          <Text style={[styles.planPrice, { color: colors.text }]}>$39.99</Text>
          <Text style={[styles.planDesc, { color: colors.muted }]}>
            Save 33% across the year.
          </Text>
        </View>
      </View>
      <Text style={[styles.trialNote, { color: colors.muted }]}>
        30 day free trial on all plans — enjoy full access before you pay.
      </Text>
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
  plansContainer: {
    marginTop: 24,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  planCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  planCardHighlight: {
    borderWidth: 2,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
  },
  planPrice: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: '800',
  },
  planDesc: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  trialNote: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
  },
});
