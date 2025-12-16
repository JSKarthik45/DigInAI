import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Image } from 'react-native';
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
    headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 12 },
    emptyText: {
      fontSize: 14,
      color: colors.muted,
      textAlign: 'center',
      marginTop: 24,
    },
    card: {
      width: '100%',
      borderRadius: 12,
      padding: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginBottom: 10,
    },
    cardRow: { flexDirection: 'row', alignItems: 'center' },
    thumbnail: { width: 56, height: 56, borderRadius: 28, marginRight: 12, borderWidth: 1, borderColor: '#000', overflow: 'hidden', backgroundColor: '#fff' },
    cardContent: { flex: 1, justifyContent: 'center' },
    productName: { fontSize: 16, fontWeight: '700' },
    dateText: { fontSize: 13, color: colors.muted, marginTop: 4 },
    cardSubtitle: {
      fontSize: 14,
      color: colors.muted,
      marginTop: 4,
    },
    indicator: { width: 24, alignItems: 'center', justifyContent: 'center' },
    dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.6)', marginVertical: 2 },
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
    subtitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    subtitleLeft: { flexDirection: 'row', alignItems: 'center' },
    subtitleRight: { flexDirection: 'row', alignItems: 'center' },
    subtitleInfoText: { fontSize: 14, color: colors.muted, marginLeft: 8 },
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

  const getCardColors = (item) => {
    // Determine a rating value from known fields
    const raw = item.rating || item.healthRating || item.risk || item.score || item.level;
    // Normalize strings to lowercase
    const key = typeof raw === 'string' ? raw.toLowerCase() : null;

    // Palette
    const palette = {
      excellent: { bg: '#0f9d58', text: '#ffffff' }, // dark green
      good: { bg: '#86efac', text: '#111827' }, // light green
      moderate: { bg: '#facc15', text: '#111827' }, // mustard
      medium: { bg: '#fb7185', text: '#111827' }, // light red/pink
      high: { bg: '#7f1d1d', text: '#ffffff' }, // dark maroon
      default: { bg: colors.surface, text: colors.text },
    };

    if (key) {
      if (key.includes('excellent') || key.includes('low')) return palette.excellent;
      if (key.includes('good') || key.includes('moderate') || key.includes('acceptable')) return palette.good;
      if (key.includes('moderate') || key.includes('warning')) return palette.moderate;
      if (key.includes('medium') || key.includes('some') || key.includes('unhealthy')) return palette.medium;
      if (key.includes('high') || key.includes('danger') || key.includes('unhealthy')) return palette.high;
    }

    // If numeric score present, map thresholds (0-100 where lower is better)
    if (typeof raw === 'number') {
      const n = raw;
      if (n >= 0 && n <= 20) return palette.excellent;
      if (n > 20 && n <= 40) return palette.good;
      if (n > 40 && n <= 60) return palette.moderate;
      if (n > 60 && n <= 80) return palette.medium;
      if (n > 80) return palette.high;
    }

    return palette.default;
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
      <View style={{ marginBottom: 12, alignItems: 'center' }}>
        <View style={styles.subtitleLeft}>
          <Ionicons name="information-circle-outline" size={16} color={colors.muted} />
          <Text style={styles.subtitleInfoText}>Tap an item for details</Text>
        </View>
        <View style={[styles.subtitleLeft, { marginTop: 8 }]}>
          <Ionicons name="trash-outline" size={16} color={colors.muted} />
          <Text style={styles.subtitleInfoText}>Swipe Left to delete</Text>
        </View>
      </View>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>
          No scans yet. Use the Scanner tab to scan barcodes or ingredient lists.
        </Text>
      ) : (
        items.map((item) => {
          const colorsFor = getCardColors(item);
          return (
            <View key={item.id} style={styles.rowContainer}>
              <Swipeable
                overshootRight={false}
                renderRightActions={(progress, dragX) => renderRightActions(progress, dragX)}
                onSwipeableRightOpen={() => handleDelete(item.id)}
              >
                <Pressable onPress={() => handlePress(item)} style={[styles.card, { backgroundColor: colorsFor.bg, borderColor: colors.border }]}>
                  <View style={styles.cardRow}>
                    {item.thumbnail ? (
                      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                    ) : (
                      <View style={styles.thumbnail} />
                    )}
                    <View style={styles.cardContent}>
                      <Text style={[styles.productName, { color: colorsFor.text }]}> 
                        {item.type === 'barcode' ? item.productName || 'Barcode scan' : item.itemName || 'Ingredients scan'}
                      </Text>
                      <Text style={[styles.dateText, { color: colorsFor.text === '#ffffff' ? 'rgba(255,255,255,0.85)' : colors.muted }]}>{formatDate(item.createdAt)}</Text>
                      {item.ingredientsText ? (
                        <Text numberOfLines={2} style={[styles.cardSubtitle, { color: colorsFor.text === '#ffffff' ? 'rgba(255,255,255,0.9)' : colors.muted }]}>
                          {item.ingredientsText}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.indicator}>
                      <View style={styles.dot} />
                      <View style={styles.dot} />
                      <View style={styles.dot} />
                      <View style={styles.dot} />
                      <View style={styles.dot} />
                    </View>
                  </View>
                </Pressable>
              </Swipeable>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
