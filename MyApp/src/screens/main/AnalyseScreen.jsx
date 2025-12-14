import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
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
    title: { ...typography.title, marginBottom: 8 },
    subtitle: { ...typography.subtitle, marginBottom: 12 },
    body: { ...typography.body, marginBottom: 8 },
    card: {
      borderRadius: 16,
      padding: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.background,
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.secondary,
      marginTop: 8,
    },
    value: {
      fontSize: 14,
      color: colors.text,
      marginTop: 4,
    },
    input: {
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
      color: colors.text,
      marginTop: 4,
    },
    inputHint: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 4,
    },
  });

export default function AnalyseScreen() {
  const colors = useThemeColors();
  const styles = styleFactory(colors);
  const route = useRoute();
   const navigation = useNavigation();
  const params = route.params || {};
  const [barcode, setBarcode] = useState(params.barcode || null);
  const [ingredientsText, setIngredientsText] = useState(params.ingredientsText || null);
  const [productData, setProductData] = useState(params.productData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itemName, setItemName] = useState(params.itemName || '');
  const hasSavedIngredientsRef = useRef(false);

  const appendHistoryEntry = async (entry) => {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const updated = [{ id: Date.now().toString(), ...entry }, ...list];
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (err) {
      console.log('Error updating history in Analyse', err);
    }
  };

  const saveIngredientsHistoryIfNeeded = async (nameFromInput) => {
    if (hasSavedIngredientsRef.current) return;
    if (!ingredientsText) return;

    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      const list = raw ? JSON.parse(raw) : [];

      let finalName = (nameFromInput || itemName || '').trim();
      if (!finalName) {
        const existingNumbers = list
          .filter((it) => it.type === 'ingredients' && typeof it.itemName === 'string')
          .map((it) => {
            const match = /^item(\d+)$/.exec(it.itemName.trim().toLowerCase());
            return match ? parseInt(match[1], 10) : null;
          })
          .filter((n) => n != null);
        const nextNum = existingNumbers.length ? Math.max(...existingNumbers) + 1 : 1;
        finalName = `item${nextNum}`;
      }

      await appendHistoryEntry({
        type: 'ingredients',
        itemName: finalName,
        ingredientsText,
        createdAt: new Date().toISOString(),
      });

      hasSavedIngredientsRef.current = true;
    } catch (err) {
      console.log('Error saving ingredients history from Analyse', err);
    }
  };

  useEffect(() => {
    const nextParams = route.params || {};
    setBarcode(nextParams.barcode || null);
    setIngredientsText(nextParams.ingredientsText || null);
    setItemName(nextParams.itemName || '');
    if (nextParams.productData) {
      setProductData(nextParams.productData);
      setLoading(false);
      setError(null);
      return;
    }

    if (nextParams.barcode && !nextParams.productData) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${nextParams.barcode}.json`);
          const apiData = await response.json();
          setProductData(apiData);
        } catch (err) {
          console.log('Error fetching product data in Analyse', err);
          setError('Could not load product details.');
          setProductData(null);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [route.params]);

  useEffect(() => {
    const currentParams = route.params || {};
    if (currentParams.source !== 'ingredients') {
      return;
    }

    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (!hasSavedIngredientsRef.current) {
        // Fire and forget; navigation will continue while we persist.
        saveIngredientsHistoryIfNeeded();
      }
    });

    return unsubscribe;
  }, [navigation, route.params, saveIngredientsHistoryIfNeeded]);

  const product = productData?.product;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.subtitle}>
        Review scan
      </Text>

      {loading && (
        <Text style={styles.subtitle}>Loading product details…</Text>
      )}

      {error && (
        <Text style={[styles.subtitle, { color: colors.secondary }]}>{error}</Text>
      )}

      {!barcode && !product && !ingredientsText && !loading && (
        <Text style={styles.subtitle}>
          Nothing scanned yet. Start from the Scanner tab.
        </Text>
      )}

      {barcode && (
        <View style={styles.card}>
          <Text style={styles.label}>Barcode</Text>
          <Text style={styles.value}>{barcode}</Text>
        </View>
      )}

      {product && (
        <View style={styles.card}>
          <Text style={styles.label}>Product</Text>
          <Text style={styles.value}>{product.product_name || 'Unknown product'}</Text>
          {product.brands ? (
            <>
              <Text style={styles.label}>Brand</Text>
              <Text style={styles.value}>{product.brands}</Text>
            </>
          ) : null}
          {product.generic_name ? (
            <>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>{product.generic_name}</Text>
            </>
          ) : null}
          {typeof product.completeness === 'number' && (
            <>
              <Text style={styles.label}>Data completeness</Text>
              <Text style={styles.value}>{Math.round(product.completeness * 100)}%</Text>
            </>
          )}
        </View>
      )}

      {(route.params?.source === 'ingredients' || route.params?.source === 'history-ingredients') && (
        <View style={styles.card}>
          <Text style={styles.label}>Item name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter product name (optional)"
            placeholderTextColor={colors.muted}
            value={itemName}
            onChangeText={setItemName}
            onEndEditing={(e) => {
              const value = e.nativeEvent.text;
              setItemName(value);
              if (route.params?.source === 'ingredients') {
                saveIngredientsHistoryIfNeeded(value);
              }
            }}
            returnKeyType="done"
          />
          <Text style={styles.inputHint}>
            If you leave this blank, we will save it as item1, item2, etc.
          </Text>
        </View>
      )}

      {ingredientsText && (
        <View style={styles.card}>
          <Text style={styles.label}>Ingredients (OCR)</Text>
          <Text style={styles.value}>{ingredientsText}</Text>
        </View>
      )}
    </ScrollView>
  );
}
