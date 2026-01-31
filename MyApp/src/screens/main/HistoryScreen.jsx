import React, { useCallback, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColors } from '../../theme/ThemeContext';

// Components
import { HistoryItemCard, HistoryEmptyState, HistoryHints } from '../../components/history';

const HISTORY_KEY = 'scan_history_v1';

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingBottom: 24,
    },
  });

// Helper to determine card color based on rating
const getCardColors = (item, colors) => {
  if (item.cardColor) {
    return { bg: item.cardColor, text: '#000000' };
  }

  const raw = item.rating || item.healthRating || item.risk || item.score || item.level;
  const key = typeof raw === 'string' ? raw.toLowerCase() : null;

  const palette = {
    excellent: { bg: '#0f9d58', text: '#ffffff' },
    good: { bg: '#86efac', text: '#111827' },
    moderate: { bg: '#facc15', text: '#111827' },
    medium: { bg: '#fb7185', text: '#111827' },
    high: { bg: '#7f1d1d', text: '#ffffff' },
    default: { bg: colors.surface, text: colors.text },
  };

  if (key) {
    if (key.includes('excellent') || key.includes('low')) return palette.excellent;
    if (key.includes('good') || key.includes('acceptable')) return palette.good;
    if (key.includes('moderate') || key.includes('warning')) return palette.moderate;
    if (key.includes('medium') || key.includes('some')) return palette.medium;
    if (key.includes('high') || key.includes('danger') || key.includes('unhealthy')) return palette.high;
  }

  if (typeof raw === 'number') {
    if (raw >= 0 && raw <= 20) return palette.excellent;
    if (raw > 20 && raw <= 40) return palette.good;
    if (raw > 40 && raw <= 60) return palette.moderate;
    if (raw > 60 && raw <= 80) return palette.medium;
    if (raw > 80) return palette.high;
  }

  return palette.default;
};

export default function HistoryScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation();
  const [items, setItems] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const load = async () => {
        try {
          const raw = await AsyncStorage.getItem(HISTORY_KEY);
          const list = raw ? JSON.parse(raw) : [];
          if (isActive) {
            setItems(list);
          }
        } catch (err) {}
      };
      load();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleDelete = async (id) => {
    try {
      const nextItems = items.filter((it) => it.id !== id);
      setItems(nextItems);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(nextItems));
    } catch (err) {}
  };

  const handlePress = (item) => {
    const parentNav = navigation.getParent?.();
    if (!parentNav) return;

    if (item.type === 'barcode' && item.barcode) {
      parentNav.navigate('Analyse', {
        source: 'history-barcode',
        barcode: item.barcode,
        ingredientsText: item.ingredientsText,
        itemName: item.productName,
        createdAt: item.createdAt,
      });
    } else if (item.type === 'ingredients' && item.ingredientsText) {
      parentNav.navigate('Analyse', {
        source: 'history-ingredients',
        ingredientsText: item.ingredientsText,
        itemName: item.itemName,
        createdAt: item.createdAt,
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.listContent}>
      <HistoryHints />
      
      {items.length === 0 ? (
        <HistoryEmptyState />
      ) : (
        items.map((item) => (
          <HistoryItemCard
            key={item.id}
            item={item}
            cardColor={getCardColors(item, colors)}
            onPress={handlePress}
            onDelete={handleDelete}
          />
        ))
      )}
    </ScrollView>
  );
}
