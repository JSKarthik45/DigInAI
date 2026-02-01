import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../theme/ThemeContext';

// Components
import { AnalyseHeader, HealthRatingCard, FlaggedColourCard } from '../../components/analyse';
import { Button, LoadingOverlay, SectionHeader } from '../../components/common';

// Constants
const HISTORY_KEY = 'scan_history_v1';
const COLOUR_INFO_KEY = 'food_colour_info_v1';

// Default metadata for food colour E-codes
const DEFAULT_COLOUR_INFO_MAP = {
  '102': ['Tartrazine', 'Yellow 5', 'None', 'EU, UK', 'Hyperactivity in children, hives, asthma triggers, and allergic reactions.'],
  '110': ['Sunset Yellow FCF', 'Yellow 6', 'None', 'EU, UK', 'Hyperactivity, chromosomal damage, and worsening of eczema/hives.'],
  '122': ['Carmoisine', 'Azorubine', 'USA, Canada, Japan, Sweden, Austria', 'EU, UK', 'Hyperactivity and potential link to bladder cancer; restricted due to lack of safety data in the US.'],
  '124': ['Ponceau 4R', 'Cochineal Red A', 'USA, Canada, Finland', 'EU, UK', 'Suspected carcinogen and high trigger for hyperactivity and DNA damage concerns.'],
  '127': ['Erythrosine', 'Red 3', 'USA, EU, UK, Australia, NZ, Japan', 'None', 'Linked to thyroid tumors, chromosomal damage, and neurotoxicity in children.'],
  '129': ['Allura Red AC', 'Red 40', 'Denmark, Belgium, France, Germany, Switzerland, Austria', 'EU, UK', 'Hyperactivity, potential DNA damage, and link to inflammatory bowel disease (IBD).'],
  '132': ['Indigo Carmine', 'Blue 2', 'None', 'None', 'High doses linked to respiratory issues, skin sensitivity, and potential brain tumor concerns in rat studies.'],
  '133': ['Brilliant Blue FCF', 'Blue 1', 'None', 'None', 'Possible neurotoxicity and cross-reactivity in people with existing allergies or asthma.'],
  '143': ['Fast Green FCF', 'Green 3', 'EU, UK, Japan, South Korea, China', 'None', 'Banned in Europe due to poor absorption and suspected tumorigenic (tumor-causing) effects in animal studies.'],
};

// Styles factory
const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 40,
      paddingHorizontal: 16,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 24,
    },
    section: {
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    bulletDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.text,
      marginTop: 7,
      marginRight: 8,
    },
    bulletText: {
      fontSize: 13,
      color: colors.text,
      flex: 1,
    },
    noDataText: {
      fontSize: 13,
      color: colors.muted,
    },
    footerButtons: {
      flexDirection: 'row',
      marginTop: 8,
      gap: 12,
    },
  });

// Utility to append history entry
const appendHistoryEntry = async (entry) => {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const updated = [{ id: Date.now().toString(), ...entry }, ...list];
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save history entry:', err);
  }
};

// Custom hook for colour info
const useColourInfo = () => {
  const [colourInfoMap, setColourInfoMap] = useState(null);

  useEffect(() => {
    const loadColourInfo = async () => {
      try {
        const raw = await AsyncStorage.getItem(COLOUR_INFO_KEY);
        if (!raw) {
          await AsyncStorage.setItem(COLOUR_INFO_KEY, JSON.stringify(DEFAULT_COLOUR_INFO_MAP));
          setColourInfoMap(DEFAULT_COLOUR_INFO_MAP);
          return;
        }
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const merged = { ...DEFAULT_COLOUR_INFO_MAP };
          for (const k of Object.keys(parsed)) {
            const val = parsed[k];
            if (Array.isArray(val)) {
              const def = DEFAULT_COLOUR_INFO_MAP[k] || [];
              const filled = val.slice(0, 5);
              for (let i = filled.length; i < 5; i++) {
                filled[i] = def[i] || '';
              }
              merged[k] = filled;
            } else {
              merged[k] = parsed[k];
            }
          }
          await AsyncStorage.setItem(COLOUR_INFO_KEY, JSON.stringify(merged));
          setColourInfoMap(merged);
        } else {
          setColourInfoMap(DEFAULT_COLOUR_INFO_MAP);
        }
      } catch (err) {
        setColourInfoMap(DEFAULT_COLOUR_INFO_MAP);
      }
    };
    loadColourInfo();
  }, []);

  return colourInfoMap;
};

// Extract colour codes from product data
const extractColourCodes = (productData, ingredientsText) => {
  const colourSet = new Set();
  const product = productData?.product;

  // From API ingredients tags
  if (Array.isArray(product?.ingredients_tags)) {
    for (const tag of product.ingredients_tags) {
      if (typeof tag !== 'string') continue;
      const body = (tag.split(':')[1] || tag).toLowerCase();
      const matches = Array.from(body.matchAll(/([0-9]{1,3}[a-z]?)/gi), (m) => m[1]);
      if (matches.length === 0) {
        const m2 = /e([0-9]{2,3}[a-z]?)/i.exec(tag);
        if (m2) matches.push(m2[1]);
      }
      for (const nm of matches) {
        const num = parseInt(nm, 10);
        if (Number.isFinite(num) && num >= 100 && num < 200) {
          colourSet.add(`E${nm}`.toUpperCase());
        }
      }
    }
  }

  // From OCR text
  if (typeof ingredientsText === 'string' && ingredientsText.trim().length > 0) {
    const lower = ingredientsText.toLowerCase();

    // E-codes
    for (const match of lower.matchAll(/\be[\s-]?([0-9]{2,3}[a-z]?)/g)) {
      const num = parseInt(match[1], 10);
      if (Number.isFinite(num) && num >= 100 && num < 200) {
        colourSet.add(`E${match[1]}`.toUpperCase());
      }
    }

    // INS codes
    for (const match of lower.matchAll(/\bins\s*([0-9]{3}[a-z]?)/g)) {
      const num = parseInt(match[1], 10);
      if (Number.isFinite(num) && num >= 100 && num < 200) {
        colourSet.add(`E${match[1]}`.toUpperCase());
      }
    }

    // Colours keyword
    for (const match of lower.matchAll(/\b(?:colour|color)s?[^0-9]{0,15}([^\n\r]+)/g)) {
      const nums = Array.from((match[1] || '').matchAll(/(\d{3})/g), (m) => m[1]);
      for (const rawNum of nums) {
        const num = parseInt(rawNum, 10);
        if (Number.isFinite(num) && num >= 100 && num < 200) {
          colourSet.add(`E${rawNum}`.toUpperCase());
        }
      }
    }
  }

  return Array.from(colourSet).sort();
};

// Calculate health score
const calculateHealthScore = (colorCodes, flaggedColours) => {
  const totalColors = Math.max(1, colorCodes.length);
  let bannedCountriesTotal = 0;
  let warnCountriesTotal = 0;
  let bannedColoursCount = 0;

  for (const f of flaggedColours) {
    if (f.bannedCountries) {
      bannedCountriesTotal += f.bannedCountries.split(',').filter(Boolean).length;
      bannedColoursCount += 1;
    }
    if (f.warningCountries) {
      warnCountriesTotal += f.warningCountries.split(',').filter(Boolean).length;
    }
  }

  const penalty = Math.min(
    95,
    bannedCountriesTotal * 5 + warnCountriesTotal * 2 + (bannedColoursCount / totalColors) * 15
  );
  const score = Math.max(0, Math.round(100 - penalty));

  let label = 'Good';
  if (score < 50) label = 'Poor';
  else if (score < 70) label = 'Caution';
  else if (score < 85) label = 'Moderate';

  return { score, label };
};

export default function AnalyseScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const params = route.params || {};

  // State
  const [barcode, setBarcode] = useState(params.barcode || null);
  const [ingredientsText, setIngredientsText] = useState(params.ingredientsText || null);
  const [productData, setProductData] = useState(params.productData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itemName, setItemName] = useState(params.itemName || '');
  const [thumbnail, setThumbnail] = useState(params.thumbnail || null);

  // Refs
  const hasSavedIngredientsRef = useRef(false);
  const hasSavedBarcodeRef = useRef(false);
  const hasOfferedBarcodeFallbackRef = useRef(false);

  // Hooks
  const colourInfoMap = useColourInfo();

  // Derived state
  const product = productData?.product;
  const isEmptyState = !barcode && !product && !ingredientsText && !loading && !error;

  const displayName = useMemo(() => {
    if (itemName?.trim().length > 0) return itemName.trim();
    if (product?.product_name) return product.product_name;
    if (barcode) return `Barcode ${barcode}`;
    return 'Analysis';
  }, [itemName, product, barcode]);

  const formattedScanTime = useMemo(() => {
    if (!params.createdAt) return 'Just now';
    try {
      return new Date(params.createdAt).toLocaleString();
    } catch {
      return params.createdAt;
    }
  }, [params.createdAt]);

  const colorCodes = useMemo(() => 
    extractColourCodes(productData, ingredientsText), 
    [productData, ingredientsText]
  );

  const flaggedColours = useMemo(() => {
    if (!colorCodes.length || !colourInfoMap) return [];
    
    const results = [];
    const normalizeField = (value) => {
      if (!value) return '';
      if (Array.isArray(value)) return value.join(', ');
      const s = String(value).trim();
      return (!s || s.toLowerCase() === 'none') ? '' : s;
    };

    for (const code of colorCodes) {
      const match = /([0-9]{3})/.exec(code);
      if (!match) continue;
      const entry = colourInfoMap[match[1]];
      if (!entry || !Array.isArray(entry)) continue;

      const [properName, commonName, warningRaw, bannedRaw, explanationRaw] = entry;
      const warningCountries = normalizeField(warningRaw);
      const bannedCountries = normalizeField(bannedRaw);

      if (!warningCountries && !bannedCountries) continue;

      results.push({
        code,
        properName: properName || '',
        commonName: commonName || '',
        warningCountries,
        bannedCountries,
        explanation: explanationRaw || '',
      });
    }
    return results;
  }, [colorCodes, colourInfoMap]);

  const { score: healthScore, label: healthLabel } = useMemo(() => 
    calculateHealthScore(colorCodes, flaggedColours),
    [colorCodes, flaggedColours]
  );

  const ratingColor = useMemo(() => {
    const lbl = (healthLabel || '').toLowerCase();
    if (lbl === 'good') return colors.success;
    if (lbl === 'moderate') return colors.primary;
    if (lbl === 'caution') return colors.warning;
    return colors.danger;
  }, [healthLabel, colors]);

  // Save ingredients history
  const saveIngredientsHistory = useCallback(async () => {
    if (hasSavedIngredientsRef.current || !ingredientsText) return;

    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      const list = raw ? JSON.parse(raw) : [];

      let finalName = (itemName || '').trim();
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
        colorCodes,
        thumbnail,
        createdAt: new Date().toISOString(),
        healthLabel,
        cardColor: ratingColor,
      });

      hasSavedIngredientsRef.current = true;
    } catch (err) {
      console.warn('Failed to save ingredients history:', err);
    }
  }, [ingredientsText, itemName, thumbnail, healthLabel, ratingColor, colorCodes]);

  // Sync with route params
  useEffect(() => {
    const nextParams = route.params || {};
    setBarcode(nextParams.barcode || null);
    setIngredientsText(nextParams.ingredientsText || null);
    setItemName(nextParams.itemName || '');
    setThumbnail(nextParams.thumbnail || null);
    setError(null);

    // Handle empty OCR
    if (nextParams.source === 'ingredients' && !nextParams.ingredientsText) {
      setProductData(null);
      setLoading(false);
      setError('Could not read ingredients from photo. Please retake the picture.');
      return;
    }

    if (nextParams.productData) {
      setProductData(nextParams.productData);
      setLoading(false);
      return;
    }

    // Fetch product for barcode
    if (nextParams.barcode && !nextParams.productData) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            `https://world.openfoodfacts.org/api/v0/product/${nextParams.barcode}.json`
          );
          setProductData(await response.json());
        } catch {
          setError('Could not load product details.');
          setProductData(null);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [route.params]);

  // Save history on navigation away
  useEffect(() => {
    if (route.params?.source !== 'ingredients') return;
    return navigation.addListener('beforeRemove', () => {
      if (!hasSavedIngredientsRef.current) saveIngredientsHistory();
    });
  }, [navigation, route.params, saveIngredientsHistory]);

  // Barcode fallback prompt
  useEffect(() => {
    if (route.params?.source !== 'barcode' || loading || !productData) return;
    if (hasOfferedBarcodeFallbackRef.current) return;

    const notFound = productData.status === 0 || !productData.product;
    const noColours = colorCodes.length === 0;

    if (!notFound && !noColours) return;

    hasOfferedBarcodeFallbackRef.current = true;

    Alert.alert(
      'Scan ingredients instead',
      notFound
        ? 'Could not find this barcode in our database.'
        : 'No colour additives found from barcode data.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
        {
          text: 'Scan ingredients',
          onPress: () => {
            navigation.getParent?.()?.navigate('MainTabs', {
              screen: 'Scanner',
              params: { startIngredientsScan: true },
            });
            navigation.goBack();
          },
        },
      ]
    );
  }, [route.params, loading, productData, colorCodes, navigation]);

  // Save barcode history
  useEffect(() => {
    if (route.params?.source !== 'barcode' || !productData?.product) return;
    if (hasSavedBarcodeRef.current) return;

    appendHistoryEntry({
      type: 'barcode',
      barcode: route.params.barcode,
      productName: productData.product.product_name || 'Unknown product',
      colorCodes,
      thumbnail: route.params.thumbnail,
      createdAt: route.params.createdAt || new Date().toISOString(),
      healthLabel,
      cardColor: ratingColor,
    });

    hasSavedBarcodeRef.current = true;
  }, [route.params, productData, healthLabel, ratingColor]);

  const handleClose = () => navigation.goBack();

  const coloursSummaryText = colorCodes.length
    ? colorCodes.join(', ')
    : 'No colour additives detected.';

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <AnalyseHeader
        productName={displayName}
        scanTime={formattedScanTime}
        ratingColor={ratingColor}
        onClose={handleClose}
      />

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <HealthRatingCard
          score={healthScore}
          label={healthLabel}
          backgroundColor={ratingColor}
        />

        <View style={styles.section}>
          <SectionHeader title="Colours found in this product" />
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>{coloursSummaryText}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Colours Banned Or Warned" />
          {colorCodes.length === 0 ? (
            <Text style={styles.noDataText}>
              No colour additives detected in this product.
            </Text>
          ) : flaggedColours.length === 0 ? (
            <Text style={styles.noDataText}>
              No high-risk colour additives flagged based on current data.
            </Text>
          ) : (
            flaggedColours.map((item, i) => (
              <FlaggedColourCard key={`${item.code}-${i}`} {...item} />
            ))
          )}
        </View>

        <View style={styles.footerButtons}>
          <Button 
            title="SHARE ANALYSIS" 
            variant="primary" 
            onPress={() => {}}
            style={{ flex: 1 }}
            textStyle={{ textAlign: 'center' }}
          />
          <Button 
            title="BACK" 
            variant="secondary" 
            onPress={handleClose}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>

      <LoadingOverlay
        visible={loading || !!error || isEmptyState}
        loading={loading}
        error={error}
        emptyState={isEmptyState}
        onBack={handleClose}
        bottomInset={insets.bottom}
      />
    </View>
  );
}
