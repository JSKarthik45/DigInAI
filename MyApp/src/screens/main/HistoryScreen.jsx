import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme/ThemeContext';
import { typography } from '../../theme';

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
      backgroundColor: colors.background,
      marginBottom: 10,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    cardSubtitle: {
      fontSize: 14,
      color: colors.muted,
      marginTop: 4,
    },
    rowContainer: {
      marginBottom: 10,
    },
    deleteAction: {
      width: 72,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#dc2626',
      borderRadius: 12,
      marginBottom: 10,
    },
    title: { ...typography.title, marginBottom: 8 },
    subtitle: { ...typography.subtitle, marginBottom: 12 },
    body: { ...typography.body, marginBottom: 8 },
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

  const handleDelete = async (id) => {
    try {
      const nextItems = items.filter((it) => it.id !== id);
      setItems(nextItems);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(nextItems));
    } catch (err) {
      console.log('Error deleting history item', err);
    }
  };

  const renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0.8],
      extrapolate: 'clamp',
    });
    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    return (
      <Animated.View style={[styles.deleteAction, { opacity, transform: [{ scale }] }]}>
        <Ionicons name="trash" size={24} color="#fff" />
      </Animated.View>
    );
  };

  const handlePress = (item) => {
    if (item.type === 'barcode' && item.barcode) {
      navigation.navigate('Analyse', {
        source: 'history-barcode',
        barcode: item.barcode,
        ingredientsText: item.ingredientsText,
        itemName: item.productName,
      });
    } else if (item.type === 'ingredients' && item.ingredientsText) {
      navigation.navigate('Analyse', {
        source: 'history-ingredients',
        ingredientsText: item.ingredientsText,
        itemName: item.itemName,
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
      <Text style = {styles.subtitle}>
        <Ionicons name="finger-print" size={16} color={colors.primary} />
        Click on the item to view its details{"\n"}
        <Ionicons name="arrow-back" size={16} color={colors.primary} /> 
        Swipe left on an item to delete it
      </Text>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>
          No scans yet. Use the Scanner tab to scan barcodes or ingredient lists.
        </Text>
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.rowContainer}>
            <Swipeable
              overshootRight={false}
              renderRightActions={(progress, dragX) => renderRightActions(progress, dragX)}
              onSwipeableRightOpen={() => handleDelete(item.id)}
            >
              <Pressable onPress={() => handlePress(item)} style={styles.card}>
                <Text style={styles.cardTitle}>
                  {item.type === 'barcode'
                    ? item.productName || 'Barcode scan'
                    : item.itemName || 'Ingredients scan'}
                </Text>
                <Text style={styles.cardSubtitle}>{formatDate(item.createdAt)}</Text>
                {item.type === 'barcode' && item.barcode ? (
                  <Text style={styles.cardSubtitle}>Barcode: {item.barcode}</Text>
                ) : null}
                {item.ingredientsText ? (
                  <Text numberOfLines={2} style={styles.cardSubtitle}>
                    {item.ingredientsText}
                  </Text>
                ) : null}
              </Pressable>
            </Swipeable>
          </View>
        ))
      )}
    </ScrollView>
  );
}
