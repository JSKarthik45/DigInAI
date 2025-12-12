import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColors } from '../../theme/ThemeContext';

const HISTORY_KEY = 'scan_history_v1';

const styleFactory = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: colors.background,
    },
    emptyText: {
      fontSize: 14,
      color: colors.muted,
      textAlign: 'center',
      marginTop: 24,
    },
    card: {
      width: '100%',
      borderRadius: 12,
      padding: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.primary,
      marginBottom: 10,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    cardSubtitle: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 4,
    },
  });

export default function HistoryScreen() {
  const colors = useThemeColors();
  const styles = styleFactory(colors);
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
        } catch (err) {
          console.log('Error loading history', err);
        }
      };
      load();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const handlePress = (item) => {
    if (item.type === 'barcode' && item.barcode) {
      navigation.navigate('Analyse', {
        source: 'history-barcode',
        barcode: item.barcode,
      });
    } else if (item.type === 'ingredients' && item.ingredientsText) {
      navigation.navigate('Analyse', {
        source: 'history-ingredients',
        ingredientsText: item.ingredientsText,
      });
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>
          No scans yet. Use the Scanner tab to scan barcodes or ingredient lists.
        </Text>
      ) : (
        items.map((item) => (
          <Pressable key={item.id} onPress={() => handlePress(item)} style={styles.card}>
            <Text style={styles.cardTitle}>
              {item.type === 'barcode' ? 'Barcode scan' : 'Ingredients scan'}
            </Text>
            <Text style={styles.cardSubtitle}>{formatDate(item.createdAt)}</Text>
            {item.type === 'barcode' && item.barcode ? (
              <Text style={styles.cardSubtitle}>Barcode: {item.barcode}</Text>
            ) : null}
            {item.type === 'ingredients' && item.ingredientsText ? (
              <Text numberOfLines={2} style={styles.cardSubtitle}>
                {item.ingredientsText}
              </Text>
            ) : null}
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}
