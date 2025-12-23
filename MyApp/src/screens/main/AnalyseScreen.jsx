import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme/ThemeContext';
import { typography } from '../../theme';

const HISTORY_KEY = 'scan_history_v1';
const COLOUR_INFO_KEY = 'food_colour_info_v1';

// Default metadata for food colour E-codes. Persisted to AsyncStorage
// under COLOUR_INFO_KEY if not already present.
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

const styleFactory = (colors) =>
  StyleSheet.create({
    overlayRoot: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 40,
      paddingHorizontal: 16,
      paddingBottom: 0,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    statusPill: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.success,
      marginRight: 8,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.background,
      marginLeft: 6,
    },
    closeButton: {
      width: 38,
      height: 38,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    headerTextBlock: {
      flex: 1,
      alignItems: 'center',
      marginBottom: 0,
      paddingHorizontal: 8,
    },
    productName: {
      ...typography.title,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    metaText: {
      fontSize: 12,
      color: colors.muted,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 8,
    },
    ratingCard: {
      borderRadius: 18,
      padding: 16,
      backgroundColor: colors.success,
      marginBottom: 16,
    },
    scoreRow: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    scorePrimary: {
      fontSize: 40,
      fontWeight: '900',
      color: colors.background,
      textAlign: 'center',
      lineHeight: 44,
    },
    scoreSecondary: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.background,
      marginLeft: 6,
      opacity: 0.9,
    },
    progressTrack: {
      height: 8,
      borderRadius: 999,
      backgroundColor: colors.background,
      overflow: 'hidden',
      marginTop: 8,
    },
    progressFill: {
      height: 8,
      borderRadius: 999,
      backgroundColor: colors.text,
    },
    ratingLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.background,
      letterSpacing: 1,
      marginBottom: 8,
    },
    ratingScore: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.background,
    },
    ratingSub: {
      fontSize: 13,
      color: colors.background,
      marginTop: 4,
    },
    section: {
      marginBottom: 16,
      borderRadius: 16,
      padding: 14,
      backgroundColor: colors.surface,
    },
    plainSection: {
      marginBottom: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: 'transparent',
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
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
    flaggedHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    flaggedTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginLeft: 6,
    },
    flaggedBody: {
      fontSize: 13,
      color: colors.text,
      marginTop: 4,
    },
    flaggedMeta: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 2,
    },
    flaggedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    trendsChartRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginTop: 8,
    },
    trendsBar: {
      flex: 1,
      marginHorizontal: 2,
      borderRadius: 999,
      backgroundColor: colors.primary,
    },
    trendsFootnote: {
      fontSize: 10,
      color: colors.muted,
      marginTop: 6,
    },
    altScrollRow: {
      flexDirection: 'row',
      marginTop: 8,
    },
    altCard: {
      width: 140,
      marginRight: 10,
      borderRadius: 14,
      padding: 10,
      backgroundColor: colors.background,
      borderWidth: 2,
      borderColor: colors.border,
    },
    flaggedCard: {
      borderRadius: 12,
      padding: 12,
      backgroundColor: colors.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      marginBottom: 10,
    },
    flaggedCardRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    flaggedCardTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 6,
    },
    flaggedCardDesc: {
      fontSize: 12,
      color: colors.muted,
    },
    flaggedCardMeta: {
      fontSize: 11,
      color: colors.text,
      marginTop: 6,
    },
    altAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      marginBottom: 8,
    },
    altName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    altBrand: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 2,
    },
    footerButtons: {
      flexDirection: 'row',
      marginTop: 16,
      justifyContent: 'space-between',
    },
    buttonPrimary: {
      flex: 1,
      borderRadius: 999,
      paddingVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      marginHorizontal: 6,
    },
    buttonPrimaryText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#ffffff',
      letterSpacing: 1,
    },
    buttonSecondary: {
      flex: 1,
      borderRadius: 999,
      paddingVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.background,
      marginHorizontal: 6,
    },
    buttonSecondaryText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: 1,
    },
    buttonTertiary: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 6,
    },
    buttonTertiaryText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
    },
    input: {
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
      color: colors.text,
      marginTop: 4,
      backgroundColor: colors.background,
    },
    inputHint: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 4,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      // bottom is set dynamically so we don't cover OS controls
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.8)',
    },
    loadingCircle: {
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: colors.success,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 10,
    },
    loadingText: {
      marginTop: 24,
      fontSize: 18,
      fontWeight: '700',
      color: '#ffffff',
      textAlign: 'center',
    },
    loadingSubtitle: {
      marginTop: 6,
      fontSize: 13,
      color: 'rgba(255,255,255,0.75)',
      textAlign: 'center',
      paddingHorizontal: 32,
    },
    loadingBackButton: {
      marginTop: 16,
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: colors.surface,
    },
    loadingBackText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
  });

export default function AnalyseScreen() {
  const colors = useThemeColors();
  const styles = styleFactory(colors);
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const params = route.params || {};

  const [selectedAlt, setSelectedAlt] = useState(null);

  const [barcode, setBarcode] = useState(params.barcode || null);
  const [ingredientsText, setIngredientsText] = useState(params.ingredientsText || null);
  const [productData, setProductData] = useState(params.productData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itemName, setItemName] = useState(params.itemName || '');
  const [thumbnail, setThumbnail] = useState(params.thumbnail || null);
  const [colourInfoMap, setColourInfoMap] = useState(null);

  const hasSavedIngredientsRef = useRef(false);
  const hasSavedBarcodeRef = useRef(false);

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
        thumbnail,
        createdAt: new Date().toISOString(),
        healthLabel,
        cardColor: ratingColor,
      });

      hasSavedIngredientsRef.current = true;
    } catch (err) {
      console.log('Error saving ingredients history from Analyse', err);
    }
  };

  // Sync state with params and fetch product data as needed
  useEffect(() => {
    const nextParams = route.params || {};
    setBarcode(nextParams.barcode || null);
    setIngredientsText(nextParams.ingredientsText || null);
    setItemName(nextParams.itemName || '');
    setThumbnail(nextParams.thumbnail || null);

    // Reset any previous errors when new params arrive
    setError(null);

    // Handle ingredients OCR flows where no text was detected
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

  // Persist live ingredient scans when navigating away
  useEffect(() => {
    const currentParams = route.params || {};
    if (currentParams.source !== 'ingredients') {
      return;
    }

    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (!hasSavedIngredientsRef.current) {
        saveIngredientsHistoryIfNeeded(itemName);
      }
    });

    return unsubscribe;
  }, [navigation, route.params, itemName, ingredientsText]);

  // After barcode scan analysis is available, save history entry with label & card color
  useEffect(() => {
    const currentParams = route.params || {};
    if (currentParams.source !== 'barcode') return;
    if (!productData?.product) return;
    if (hasSavedBarcodeRef.current) return;

    const product = productData.product || {};
    const productName = product.product_name || 'Unknown product';
    const ingredientsTextFromApi = product.ingredients_text || '';
    const createdAt = currentParams.createdAt || new Date().toISOString();

    appendHistoryEntry({
      type: 'barcode',
      barcode: currentParams.barcode,
      productName,
      ingredientsText: ingredientsTextFromApi,
      thumbnail: currentParams.thumbnail || null,
      createdAt,
      healthLabel,
      cardColor: ratingColor,
    });

    hasSavedBarcodeRef.current = true;
  }, [route.params, productData, healthLabel, ratingColor]);

  // Load colour metadata (name, common name, warning/banned countries) from AsyncStorage.
  // If missing, seed AsyncStorage with DEFAULT_COLOUR_INFO_MAP.
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
          // Merge parsed map with defaults to ensure explanation column exists.
          const merged = { ...DEFAULT_COLOUR_INFO_MAP };
          for (const k of Object.keys(parsed)) {
            const val = parsed[k];
            if (Array.isArray(val)) {
              // copy values and fill missing fields from defaults when available
              const def = DEFAULT_COLOUR_INFO_MAP[k] || [];
              const filled = val.slice(0, 5);
              // ensure length 5
              for (let i = filled.length; i < 5; i++) {
                filled[i] = def[i] || '';
              }
              merged[k] = filled;
            } else {
              merged[k] = parsed[k];
            }
          }
          // persist merged map back to storage to include explanations
          try {
            await AsyncStorage.setItem(COLOUR_INFO_KEY, JSON.stringify(merged));
          } catch (e) {
            console.log('Error persisting merged colour info map', e);
          }
          setColourInfoMap(merged);
        } else {
          setColourInfoMap(DEFAULT_COLOUR_INFO_MAP);
        }
      } catch (err) {
        console.log('Error loading colour info map', err);
        setColourInfoMap(DEFAULT_COLOUR_INFO_MAP);
      }
    };

    loadColourInfo();
  }, []);

  const product = productData?.product;

  const isEmptyState = !barcode && !product && !ingredientsText && !loading && !error;

  const displayName = useMemo(() => {
    if (itemName && itemName.trim().length > 0) return itemName.trim();
    if (product?.product_name) return product.product_name;
    if (barcode) return `Barcode ${barcode}`;
    return 'Analysis';
  }, [itemName, product, barcode]);

  const formattedScanTime = useMemo(() => {
    if (!params.createdAt) return 'Just now';
    try {
      const d = new Date(params.createdAt);
      return d.toLocaleString();
    } catch {
      return params.createdAt;
    }
  }, [params.createdAt]);

  // Extract only food colour E-codes from OpenFoodFacts `product.ingredients_tags`.
  // Ignore other ingredient sources per request.
  const { colorCodes, emulsifierCodes } = useMemo(() => {
    const colourSet = new Set();

    const product = productData?.product;
    if (Array.isArray(product?.ingredients_tags)) {
      for (const tag of product.ingredients_tags) {
        if (typeof tag !== 'string') continue;
        // take the part after the colon if present (e.g. "en:122" -> "122")
        const body = (tag.split(':')[1] || tag).toLowerCase();
        // extract all numeric codes, e.g. "471-and-322" -> ["471","322"]
        const matches = Array.from(body.matchAll(/([0-9]{1,3}[a-z]?)/gi), (m) => m[1]);
        // also accept e-prefixed forms as fallback
        if (matches.length === 0) {
          const m2 = /e([0-9]{2,3}[a-z]?)/i.exec(tag);
          if (m2) matches.push(m2[1]);
        }
        for (const nm of matches) {
          const num = parseInt(nm, 10);
          const code = `E${nm}`.toUpperCase();
          if (!Number.isFinite(num)) continue;
          // only consider food colour range 100-199
          if (num >= 100 && num < 200) {
            colourSet.add(code);
          }
        }
      }
    }

    return {
      colorCodes: Array.from(colourSet).sort(),
      emulsifierCodes: [],
    };
  }, [productData]);

  // Enrich detected colour codes with metadata from AsyncStorage (if available)
  // and keep only those that have warning or banned countries configured.
  const flaggedColours = useMemo(() => {
    if (!Array.isArray(colorCodes) || !colorCodes.length) return [];
    if (!colourInfoMap || typeof colourInfoMap !== 'object') return [];

    const results = [];

    const normalizeField = (value) => {
      if (!value) return '';
      if (Array.isArray(value)) return value.join(', ');
      const s = String(value).trim();
      if (!s || s.toLowerCase() === 'none') return '';
      return s;
    };

    for (const code of colorCodes) {
      const match = /([0-9]{3})/.exec(code);
      if (!match) continue;
      const key = match[1];
      const entry = colourInfoMap[key];
      if (!entry || !Array.isArray(entry)) continue;

      const [properName, commonName, warningRaw, bannedRaw, explanationRaw] = entry;
      const warningCountries = normalizeField(warningRaw);
      const bannedCountries = normalizeField(bannedRaw);
      const explanation = explanationRaw ? String(explanationRaw) : '';

      if (!warningCountries && !bannedCountries) continue;

      results.push({
        code,
        properName: properName || '',
        commonName: commonName || '',
        warningCountries,
        bannedCountries,
        explanation,
      });
    }

    return results;
  }, [colorCodes, colourInfoMap]);

  const coloursSummaryText = colorCodes.length
    ? colorCodes.join(', ')
    : 'No colour additives detected.';
  const emulsifiersSummaryText = emulsifierCodes.length
    ? emulsifierCodes.join(', ')
    : 'No emulsifiers detected.';

  // Compute weighted health score based on banned/warned country counts
  const { healthScore, healthLabel } = useMemo(() => {
    const totalColors = Math.max(1, colorCodes.length);
    let bannedCountriesTotal = 0;
    let warnCountriesTotal = 0;
    let bannedColoursCount = 0;

    for (const f of flaggedColours) {
      if (f.bannedCountries) {
        const parts = f.bannedCountries.split(',').map((s) => s.trim()).filter(Boolean);
        bannedCountriesTotal += parts.length;
        bannedColoursCount += 1;
      }
      if (f.warningCountries) {
        const parts = f.warningCountries.split(',').map((s) => s.trim()).filter(Boolean);
        warnCountriesTotal += parts.length;
      }
    }

    // Penalty model (tunable): banned country = 5 points, warning country = 2 points
    // plus an extra penalty proportional to fraction of colours that are banned.
    const penalty = Math.min(
      95,
      bannedCountriesTotal * 5 + warnCountriesTotal * 2 + (bannedColoursCount / totalColors) * 15
    );

    const score = Math.max(0, Math.round(100 - penalty));

    let label = 'Good';
    if (score >= 85) label = 'Good';
    else if (score >= 70) label = 'Moderate';
    else if (score >= 50) label = 'Caution';
    else label = 'Poor';

    return { healthScore: score, healthLabel: label };
  }, [colorCodes, flaggedColours]);

  // Determine rating card color based on computed health label
  const ratingColor = useMemo(() => {
    const lbl = (healthLabel || '').toLowerCase();
    if (lbl === 'good') return colors.success || '#2ecc71';
    if (lbl === 'moderate') return colors.primary || '#4f6ef7';
    if (lbl === 'caution') return colors.warning || '#ff9f1a';
    // poor / fallback
    return (colors.danger || '#ff3b30');
  }, [healthLabel, colors]);

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.overlayRoot, { paddingBottom: insets.bottom }]}> 
      <View style={styles.headerRow}>
        <View style={[styles.statusPill, { backgroundColor: ratingColor }]}>
          <Ionicons name="checkmark" size={20} color={colors.background} />
        </View>

        <View style={styles.headerTextBlock}>
          <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">
            {displayName}
          </Text>
          <Text style={styles.metaText}>{formattedScanTime}</Text>
        </View>

        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={18} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.ratingCard, { backgroundColor: ratingColor }]}>
          <Text style={styles.ratingLabel}>{`OVERALL HEALTH RATING: ${healthLabel.toUpperCase()}`}</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scorePrimary}>
              <Text style={styles.scorePrimary}>{String(healthScore)}</Text>
              <Text style={styles.scoreSecondary}>{`/100`}</Text>
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, healthScore))}%` }]} />
          </View>
          <Text style={styles.ratingSub}>{healthScore >= 85 ? 'This product looks good' : healthScore >= 70 ? 'Some concerns' : healthScore >= 50 ? 'Exercise caution' : 'High risk — avoid if possible'}</Text>
        </View>

        <View style={styles.plainSection}>
          <Text style={styles.sectionTitle}>Colours found in this product</Text>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>{coloursSummaryText}</Text>
          </View>
          {/* Emulsifiers omitted per request */}
        </View>

        <View style={styles.plainSection}>
          <Text style={styles.sectionTitle}>Colours Banned Or Warned</Text>
          {colorCodes.length === 0 ? (
            <Text style={styles.flaggedBody}>
              No colour additives detected in this product.
            </Text>
          ) : flaggedColours.length === 0 ? (
            <Text style={styles.flaggedBody}>
              No high-risk colour additives flagged based on current data.
            </Text>
          ) : (
            flaggedColours.map((item, i) => {
              const hasBanned = !!item.bannedCountries;
              const hasWarning = !!item.warningCountries;
              const titleText = item.properName && item.commonName
                ? `${item.code} ${item.properName} (${item.commonName})`
                : `${item.code} ${item.properName || item.commonName || ''}`.trim();

              return (
                <View key={`${item.code}-${i}`} style={styles.flaggedCard}>
                  <View style={styles.flaggedCardRow}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.flaggedHeader}>
                        {/* show banned (danger) icon if banned */}
                        {hasBanned && (
                          <Ionicons name="alert-circle" size={18} color="#ff3b30" />
                        )}
                        {/* show warning icon if warning */}
                        {hasWarning && (
                          <Ionicons name="warning" size={18} color={colors.warning} style={{ marginLeft: hasBanned ? 8 : 0 }} />
                        )}
                          <Text style={styles.flaggedTitle}>{titleText}</Text>
                      </View>
                        {hasBanned ? (
                          <Text style={styles.flaggedCardMeta}>Banned in: {item.bannedCountries}</Text>
                        ) : null}
                        {hasWarning ? (
                          <Text style={styles.flaggedCardMeta}>Warning in: {item.warningCountries}</Text>
                        ) : null}
                        {item.explanation ? (
                          <Text style={styles.flaggedCardDesc}>{item.explanation}</Text>
                        ) : null}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
        {/*
        <View style={styles.plainSection}>
          Consumption trends removed per request
        </View>
        */}

        {/*
        <View style={styles.plainSection}>
          <Text style={styles.sectionTitle}>Healthier Alternatives</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.altScrollRow}
          >
            <Pressable
              style={[
                styles.altCard,
                selectedAlt === 0 && { borderColor: colors.primary },
              ]}
              onPress={() => setSelectedAlt((s) => (s === 0 ? null : 0))}
            >
              <View style={styles.altAvatar} />
              <Text style={styles.altBrand}>Brand X</Text>
              <Text style={styles.altName}>Organic Oatmeal</Text>
            </Pressable>
            <Pressable
              style={[
                styles.altCard,
                selectedAlt === 1 && { borderColor: colors.primary },
              ]}
              onPress={() => setSelectedAlt((s) => (s === 1 ? null : 1))}
            >
              <View style={styles.altAvatar} />
              <Text style={styles.altBrand}>Brand Y</Text>
              <Text style={styles.altName}>Multi-grain Porridge</Text>
            </Pressable>
            <Pressable
              style={[
                styles.altCard,
                selectedAlt === 2 && { borderColor: colors.primary },
              ]}
              onPress={() => setSelectedAlt((s) => (s === 2 ? null : 2))}
            >
              <View style={styles.altAvatar} />
              <Text style={styles.altBrand}>Brand Z</Text>
              <Text style={styles.altName}>Gluten-free Oatmeal</Text>
            </Pressable>
          </ScrollView>
        </View>
        */}

        {/* Ingredients-related UI removed as requested */}

        <View style={styles.footerButtons}>
          <Pressable style={styles.buttonPrimary}>
            <Text style={styles.buttonPrimaryText}>SHARE ANALYSIS</Text>
          </Pressable>
          <Pressable style={styles.buttonSecondary}>
            <Text style={styles.buttonSecondaryText}>BUY NOW</Text>
          </Pressable>
        </View>
      </ScrollView>

      {(loading || error || isEmptyState) && (
        <View style={[styles.loadingOverlay, { bottom: insets.bottom }]}> 
          <View style={styles.loadingCircle}>
            {loading ? (
              <ActivityIndicator size="large" color="#ffffff" />
            ) : error ? (
              <Ionicons name="alert-circle" size={48} color="#ffffff" />
            ) : (
              <Ionicons name="scan-outline" size={48} color="#ffffff" />
            )}
          </View>
          <Text style={styles.loadingText}>
            {loading
              ? 'Analyzing Contents...'
              : error
              ? 'Something went wrong'
              : 'Nothing to analyze yet'}
          </Text>
          <Text style={styles.loadingSubtitle}>
            {loading
              ? 'Checking for 1000+ harmful chemicals'
              : error
              ? error || 'Please try again or go back.'
              : 'Start from the Scanner tab to analyze a product.'}
          </Text>
          {!loading && (
            <Pressable onPress={handleClose} style={styles.loadingBackButton}>
              <Text style={styles.loadingBackText}>Go Back</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
