import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme/ThemeContext';

/**
 * Mode tab bar for switching between barcode and ingredients scanning
 */
export default function ScanModeTabBar({ 
  mode, 
  onModeChange,
  style 
}) {
  const colors = useThemeColors();

  const tabs = [
    { key: 'barcode', label: 'Barcode', icon: 'scan-outline' },
    { key: 'ingredients', label: 'Ingredients', icon: 'document-text-outline' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }, style]}>
      {tabs.map((tab) => {
        const isActive = mode === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={[
              styles.tab,
              isActive && [styles.tabActive, { backgroundColor: colors.background }],
            ]}
            onPress={() => onModeChange(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={isActive ? colors.text : colors.muted}
              style={styles.icon}
            />
            <Text style={[styles.tabText, isActive && styles.tabTextActive, { color: isActive ? colors.text : colors.muted }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 6,
    paddingVertical: 6,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  tabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: '700',
  },
});
