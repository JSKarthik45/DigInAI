import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme/ThemeContext';

/**
 * Full-screen loading overlay with customizable states
 */
export default function LoadingOverlay({
  visible,
  loading = false,
  error = null,
  emptyState = false,
  title,
  subtitle,
  onBack,
  bottomInset = 0,
}) {
  const colors = useThemeColors();

  if (!visible) return null;

  const getIcon = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#ffffff" />;
    }
    if (error) {
      return <Ionicons name="alert-circle" size={48} color="#ffffff" />;
    }
    return <Ionicons name="scan-outline" size={48} color="#ffffff" />;
  };

  const getTitle = () => {
    if (title) return title;
    if (loading) return 'Analyzing Contents...';
    if (error) return 'Something went wrong';
    return 'Nothing to analyze yet';
  };

  const getSubtitle = () => {
    if (subtitle) return subtitle;
    if (loading) return 'Checking for 1000+ harmful chemicals';
    if (error) return error || 'Please try again or go back.';
    return 'Start from the Scanner tab to analyze a product.';
  };

  return (
    <View style={[styles.overlay, { bottom: bottomInset }]}>
      <View style={[styles.circle, { backgroundColor: colors.success }]}>
        {getIcon()}
      </View>
      <Text style={styles.title}>{getTitle()}</Text>
      <Text style={styles.subtitle}>{getSubtitle()}</Text>
      {!loading && onBack && (
        <Pressable onPress={onBack} style={[styles.backButton, { backgroundColor: colors.surface }]}>
          <Text style={[styles.backText, { color: colors.text }]}>Go Back</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  circle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  backButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
