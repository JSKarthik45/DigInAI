import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useThemeColors } from '../../theme/ThemeContext';

const styleFactory = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: colors.muted,
      textAlign: 'center',
      marginBottom: 16,
    },
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
  });

export default function AnalyseScreen() {
  const colors = useThemeColors();
  const styles = styleFactory(colors);
  const route = useRoute();
  const params = route.params || {};
  const [barcode, setBarcode] = useState(params.barcode || null);
  const [ingredientsText, setIngredientsText] = useState(params.ingredientsText || null);
  const [productData, setProductData] = useState(params.productData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const nextParams = route.params || {};
    setBarcode(nextParams.barcode || null);
    setIngredientsText(nextParams.ingredientsText || null);
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

  const product = productData?.product;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.subtitle}>
        Review latest scan.
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

      {ingredientsText && (
        <View style={styles.card}>
          <Text style={styles.label}>Ingredients (OCR)</Text>
          <Text style={styles.value}>{ingredientsText}</Text>
        </View>
      )}
    </ScrollView>
  );
}
