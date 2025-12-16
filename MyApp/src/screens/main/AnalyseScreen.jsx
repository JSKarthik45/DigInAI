import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Switch, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme/ThemeContext';
import { typography } from '../../theme';

const HISTORY_KEY = 'scan_history_v1';

const styleFactory = (colors) =>
  StyleSheet.create({
    overlayRoot: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 40,
      paddingHorizontal: 16,
      paddingBottom: 16,
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
      paddingBottom: 24,
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
      backgroundColor: colors.surface,
      overflow: 'hidden',
      marginTop: 8,
    },
    progressFill: {
      height: 8,
      borderRadius: 999,
      backgroundColor: colors.background,
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
      marginBottom: 18,
      borderRadius: 16,
      padding: 14,
      backgroundColor: colors.surface,
    },
    plainSection: {
      marginBottom: 18,
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
      borderWidth: StyleSheet.hairlineWidth,
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
      color: colors.muted,
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
      ...StyleSheet.absoluteFillObject,
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
  const params = route.params || {};

  const [selectedAlt, setSelectedAlt] = useState(null);

  const [barcode, setBarcode] = useState(params.barcode || null);
  const [ingredientsText, setIngredientsText] = useState(params.ingredientsText || null);
  const [productData, setProductData] = useState(params.productData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itemName, setItemName] = useState(params.itemName || '');
  const [isFlaggedToggleOn, setIsFlaggedToggleOn] = useState(false);

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

  // Sync state with params and fetch product data as needed
  useEffect(() => {
    const nextParams = route.params || {};
    setBarcode(nextParams.barcode || null);
    setIngredientsText(nextParams.ingredientsText || null);
    setItemName(nextParams.itemName || '');

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

          if (nextParams.source === 'barcode') {
            const product = apiData?.product || {};
            const productName = product.product_name || 'Unknown product';
            const ingredientsTextFromApi = product.ingredients_text || '';
            const createdAt = nextParams.createdAt || new Date().toISOString();
            await appendHistoryEntry({
              type: 'barcode',
              barcode: nextParams.barcode,
              productName,
              ingredientsText: ingredientsTextFromApi,
              createdAt,
            });
          }
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

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.overlayRoot}>
      <View style={styles.headerRow}>
        <View style={styles.statusPill}>
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
        <View style={styles.ratingCard}>
          <Text style={styles.ratingLabel}>OVERALL HEALTH RATING: GOOD</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scorePrimary}>
              <Text style={styles.scorePrimary}>{/* numeric */}</Text>
              <Text style={styles.scorePrimary}>{String((params.score ?? 85))}</Text>
              <Text style={styles.scoreSecondary}>{`/100`}</Text>
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, params.score ?? 85))}%` }]} />
          </View>
          <Text style={styles.ratingSub}>75% cleaner than category average</Text>
        </View>

        <View style={styles.plainSection}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>4 additives found in this product.</Text>
          </View>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>High in dietary fibre compared to peers.</Text>
          </View>
        </View>

        <View style={styles.plainSection}>
          <Text style={styles.sectionTitle}>Flagged Ingredients</Text>
          {/* Render flagged ingredients as individual cards */}
          {(() => {
            const list = params.flaggedIngredients || (product && product.ingredients ? product.ingredients.slice(0, 6) : []);
            if (!list || list.length === 0) {
              return (
                <>
                  <View style={styles.flaggedHeader}>
                    <Ionicons name="warning" size={18} color={colors.warning} />
                    <Text style={styles.flaggedTitle}>TARTRAZINE INGREDIENTS</Text>
                  </View>
                  <Text style={styles.flaggedBody}>
                    Linked to hyperactivity and behavioural changes in sensitive individuals, especially children.
                  </Text>
                  <Text style={styles.flaggedMeta}>EU BANNED. Potential allergic reactions and intolerance responses.</Text>
                  <View style={styles.flaggedRow}>
                    <Text style={styles.flaggedBody}>Mark as personal allergen</Text>
                    <Switch
                      value={isFlaggedToggleOn}
                      onValueChange={setIsFlaggedToggleOn}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={isFlaggedToggleOn ? colors.secondary : colors.background}
                    />
                  </View>
                </>
              );
            }

            return list.map((fi, i) => {
              const name = typeof fi === 'string' ? fi : (fi.text || fi.name || `Ingredient ${i + 1}`);
              const desc = typeof fi === 'string' ? '' : (fi.comment || fi.description || 'Potential concerns and regulatory notes.');
              return (
                <View key={`${name}-${i}`} style={styles.flaggedCard}>
                  <View style={styles.flaggedCardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.flaggedCardTitle}>{String(name).toUpperCase()}</Text>
                      {desc ? <Text style={styles.flaggedCardDesc}>{desc}</Text> : null}
                      <Text style={styles.flaggedCardMeta}>Reported in similar products.</Text>
                    </View>
                    <View style={{ marginLeft: 12, alignItems: 'center', justifyContent: 'center' }}>
                      <Switch
                        value={false}
                        onValueChange={() => {}}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.surface}
                      />
                    </View>
                  </View>
                </View>
              );
            });
          })()}
        </View>

        <View style={styles.plainSection}>
          <Text style={styles.sectionTitle}>YOUR CONSUMPTION TRENDS</Text>
          <Text style={styles.flaggedBody}>
            You scanned this product 3 times in the last 30 days.
          </Text>
          <Text style={styles.flaggedMeta}>Source: FDA database and internal DigInAI analysis.</Text>
          <View style={styles.trendsChartRow}>
            <View style={[styles.trendsBar, { height: 10, opacity: 0.5 }]} />
            <View style={[styles.trendsBar, { height: 18, opacity: 0.7 }]} />
            <View style={[styles.trendsBar, { height: 26 }]} />
            <View style={[styles.trendsBar, { height: 20, opacity: 0.8 }]} />
            <View style={[styles.trendsBar, { height: 12, opacity: 0.6 }]} />
          </View>
          <Text style={styles.trendsFootnote}>Daily scans over the past week</Text>
        </View>

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
                selectedAlt === 0 && { borderColor: colors.primary, borderWidth: 2 },
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
                selectedAlt === 1 && { borderColor: colors.primary, borderWidth: 2 },
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
                selectedAlt === 2 && { borderColor: colors.primary, borderWidth: 2 },
              ]}
              onPress={() => setSelectedAlt((s) => (s === 2 ? null : 2))}
            >
              <View style={styles.altAvatar} />
              <Text style={styles.altBrand}>Brand Z</Text>
              <Text style={styles.altName}>Gluten-free Oatmeal</Text>
            </Pressable>
          </ScrollView>
        </View>

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
        <View style={styles.loadingOverlay}>
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
