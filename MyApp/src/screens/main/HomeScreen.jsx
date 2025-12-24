import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, useThemedStyles } from '../../theme/ThemeContext';
import { typography } from '../../theme';

const styleFactory = (colors) =>
  StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 16, paddingVertical: 16, backgroundColor: colors.background },
    headerTitle: { ...typography.title, textAlign: 'center', marginBottom: 12, letterSpacing: 3 },
    subtitle: { ...typography.subtitle, marginBottom: 12 },
    tabBar: { flexDirection: 'row', alignSelf: 'center', marginTop: 8, marginBottom: 24, paddingHorizontal: 6, paddingVertical: 6, height: 64, borderRadius: 32, backgroundColor: colors.surface, alignItems: 'center' },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 999 },
    tabActive: { backgroundColor: colors.background, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    tabText: { fontSize: 16, color: colors.muted, fontWeight: '500' },
    tabTextActive: { color: colors.text, fontWeight: '700' },
    tabIcon: { marginRight: 6 },
    centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scanButton: { width: 220, height: 220, borderRadius: 110, alignItems: 'center', justifyContent: 'center', marginBottom: 16, overflow: 'hidden' },
    scanButtonText: { marginTop: 8, fontSize: 18, fontWeight: '800', color: colors.background, letterSpacing: 1.5 },
    subtitleCentered: { fontSize: 14, color: colors.muted, textAlign: 'center', paddingHorizontal: 24 },
    bottomBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 8, paddingBottom: 4, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.background },
    bottomItem: { alignItems: 'center', justifyContent: 'center' },
    bottomLabel: { fontSize: 12, marginTop: 2, color: colors.muted },
    bottomLabelActive: { color: colors.primary },

    /* scanner styles */
    scannerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
    scannerFrame: { position: 'absolute', top: '16%', left: 32, right: 32, height: 220, justifyContent: 'center', alignItems: 'center' },
    scannerFrameInner: { width: '100%', height: '100%' },
    scannerCorner: { position: 'absolute', width: 80, height: 60, borderColor: colors.primary, borderRadius: 10 },
    scannerCornerTopLeft: { top: 0, left: 0, borderTopWidth: 10, borderLeftWidth: 10, borderTopLeftRadius: 20 },
    scannerCornerTopRight: { top: 0, right: 0, borderTopWidth: 10, borderRightWidth: 10, borderTopRightRadius: 20 },
    scannerCornerBottomLeft: { bottom: 0, left: 0, borderBottomWidth: 10, borderLeftWidth: 10, borderBottomLeftRadius: 20 },
    scannerCornerBottomRight: { bottom: 0, right: 0, borderBottomWidth: 10, borderRightWidth: 10, borderBottomRightRadius: 20 },
    scannerFooter: { paddingHorizontal: 16, paddingVertical: 20, backgroundColor: colors.surface },
    scannerTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6, color: colors.primary },
    scannerText: { fontSize: 14, color: colors.muted },
    footerButtonsRow: { flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', width: '100%' },
    footerButton: { flex: 1, paddingVertical: 10, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    footerButtonSecondary: { marginRight: 8, backgroundColor: colors.background },
    footerButtonPrimary: { marginLeft: 8, backgroundColor: colors.primary},
    footerButtonText: { fontSize: 14, fontWeight: '600', color: colors.text },
    cancelButtonText: { fontSize: 14, fontWeight: '600', color: colors.text },
    // Make barcode scanner close match ingredients scanner: white background, no border, and same top margin
    cancelButton: { paddingVertical: 10, borderRadius: 999, borderWidth: 0, alignItems: 'center', justifyContent: 'center', marginLeft: 8, marginTop: 20, backgroundColor: colors.background },
    ctaContent: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  });

const HISTORY_KEY = 'scan_history_v1';

export default function HomeScreen() {
  const styles = useThemedStyles(styleFactory);
  const colors = useThemeColors();
  const navigation = useNavigation();
  const route = useRoute();

  const [mode, setMode] = useState('barcode');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState(null);
  const [productData, setProductData] = useState(null);
  

  const [ingredientsScannerVisible, setIngredientsScannerVisible] = useState(false);
  const ingredientsCameraRef = useRef(null);
  const barcodeCameraRef = useRef(null);
  const [ingredientsText, setIngredientsText] = useState(null);
  const [ingredientsProcessing, setIngredientsProcessing] = useState(false);
  const scanningRef = useRef(true);
  const [namePromptVisible, setNamePromptVisible] = useState(false);
  const [itemNameDraft, setItemNameDraft] = useState('');
  const [pendingIngredients, setPendingIngredients] = useState(null); // { uri, text }

  const appendHistoryEntry = async (entry) => {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const updated = [{ id: Date.now().toString(), ...entry }, ...list];
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (err) {}
  };

  // Ensure overlays are reset whenever we return to the Home screen
  useFocusEffect(
    useCallback(() => {
      const params = route.params || {};
      if (params.mode === 'ingredients') {
        setMode('ingredients');
      }
      if (params.startIngredientsScan) {
        setMode('ingredients');
        openIngredientsScanner();
        navigation.setParams?.({ ...params, startIngredientsScan: false });
      }
      setScannerVisible(false);
      setIngredientsScannerVisible(false);
      setScannedData(null);
      return () => {};
    }, [route.params])
  );

  const openScanner = async () => {
    const granted = permission?.granted ?? false;
    if (!granted) {
      const req = await requestPermission();
      if (!req.granted) return;
    }
    scanningRef.current = true;
    setScannedData(null);
    setScannerVisible(true);
  };

  const openIngredientsScanner = async () => {
    const granted = permission?.granted ?? false;
    if (!granted) {
      const req = await requestPermission();
      if (!req.granted) return;
    }
    setIngredientsText(null);
    setIngredientsScannerVisible(true);
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (!scanningRef.current) return;
    scanningRef.current = false;
    let thumbnailUri = null;
    try {
      if (barcodeCameraRef.current) {
        const photo = await barcodeCameraRef.current.takePictureAsync({ quality: 0.5, base64: false });
        thumbnailUri = photo?.uri || null;
      }
    } catch (err) {}
    setScannedData({ type, data });
    const barcode = data;
    const createdAt = new Date().toISOString();
    const parentNav = navigation.getParent?.();
    if (parentNav) {
      parentNav.navigate('Analyse', { source: 'barcode', barcode, createdAt, thumbnail: thumbnailUri });
    }
  };

  const recognizeIngredientsFromImage = async (uri) => {
    try {
      const result = await TextRecognition.recognize(uri);
      if (!result) return '';
      if (Array.isArray(result.blocks)) {
        const lines = result.blocks.flatMap((block) => block.lines || []);
        const text = lines.map((line) => line.text || '').join('\n');
        return text.trim();
      }
      if (typeof result.text === 'string') return result.text.trim();
      return '';
    } catch (err) {
      return '';
    }
  };

  const runIngredientsOcrFlow = async (uri, thumbnailUri) => {
    try {
      setIngredientsProcessing(true);
      const text = await recognizeIngredientsFromImage(uri);
      setIngredientsText(text);
      setPendingIngredients((prev) => {
        const baseUri = thumbnailUri || uri;
        if (prev && prev.uri === baseUri) {
          return { ...prev, text };
        }
        return { uri: baseUri, text };
      });
    } catch (err) {
    } finally {
      setIngredientsProcessing(false);
    }
  };

  const captureIngredientsPhoto = async () => {
    if (!ingredientsCameraRef.current) return;
    try {
      const photo = await ingredientsCameraRef.current.takePictureAsync({ quality: 0.8, base64: false });
      setPendingIngredients({ uri: photo.uri, text: '' });
      setItemNameDraft('');
      setNamePromptVisible(true);
      // Run OCR in the background so the name prompt appears immediately
      runIngredientsOcrFlow(photo.uri, photo.uri);
    } catch (err) {}
  };

  const handleConfirmItemName = () => {
    if (!pendingIngredients) {
      setNamePromptVisible(false);
      return;
    }
    const parentNav = navigation.getParent?.();
    const finalName = itemNameDraft.trim();
    if (parentNav) {
      parentNav.navigate('Analyse', {
        source: 'ingredients',
        ingredientsText: pendingIngredients.text || '',
        thumbnail: pendingIngredients.uri,
        itemName: finalName,
      });
    }
    setNamePromptVisible(false);
    setPendingIngredients(null);
    setItemNameDraft('');
  };

  const handleCancelItemName = () => {
    setNamePromptVisible(false);
    setPendingIngredients(null);
    setItemNameDraft('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <Pressable style={[styles.tab, mode === 'barcode' && styles.tabActive]} onPress={() => setMode('barcode')}>
          <Ionicons name="scan-outline" size={18} color={mode === 'barcode' ? colors.text : colors.muted} style={styles.tabIcon} />
          <Text style={[styles.tabText, mode === 'barcode' && styles.tabTextActive]}>Barcode</Text>
        </Pressable>
        <Pressable style={[styles.tab, mode === 'ingredients' && styles.tabActive]} onPress={() => setMode('ingredients')}>
          <Ionicons name="document-text-outline" size={18} color={mode === 'ingredients' ? colors.text : colors.muted} style={styles.tabIcon} />
          <Text style={[styles.tabText, mode === 'ingredients' && styles.tabTextActive]}>Ingredients</Text>
        </Pressable>
      </View>

      <View style={styles.centerContent}>
        <View>
          <Pressable style={styles.scanButton} onPress={mode === 'barcode' ? openScanner : openIngredientsScanner}>
            <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.primary, borderRadius: 110 }]} />
            <View style={styles.ctaContent}>
              <Ionicons name={mode === 'barcode' ? 'scan' : 'document-text'} size={76} color={colors.background} />
              <Text style={styles.scanButtonText}>TAP TO SCAN</Text>
            </View>
          </Pressable>
        </View>
        <Text style={styles.subtitleCentered}>{mode === 'barcode' ? 'Point camera at the product barcode to identify harmful additives.' : 'Point camera at the ingredients list to identify harmful additives.'}</Text>
        {/* Product lookup now handled in Analyse screen with its own loading overlay */}
        {mode === 'ingredients' && ingredientsProcessing && <Text style={[styles.subtitleCentered, { marginTop: 8 }]}>Analyzing ingredients photo…</Text>}
      </View>

      

      {scannerVisible && (
        <View style={styles.scannerOverlay}>
          <CameraView
            ref={barcodeCameraRef}
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr'] }}
            onBarcodeScanned={handleBarCodeScanned}
          />
          <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
            <View style={styles.scannerFrame}>
              <View style={styles.scannerFrameInner}>
                <View style={[styles.scannerCorner, styles.scannerCornerTopLeft]} />
                <View style={[styles.scannerCorner, styles.scannerCornerTopRight]} />
                <View style={[styles.scannerCorner, styles.scannerCornerBottomLeft]} />
                <View style={[styles.scannerCorner, styles.scannerCornerBottomRight]} />
              </View>
            </View>
          </View>
          <View style={styles.scannerFooter}>
            <Text style={styles.scannerTitle}>Scan a barcode</Text>
            {scannedData ? (
              <>
                <Text style={styles.scannerText}>Type: {scannedData.type}</Text>
                <Text style={styles.scannerText}>Value: {scannedData.data}</Text>
              </>
            ) : (
              <Text style={styles.scannerText}>Point your camera at a product barcode to see its details.</Text>
            )}
            <Pressable onPress={() => { setScannerVisible(false); scanningRef.current = true; }} style={[styles.cancelButton]}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      )}

      {ingredientsScannerVisible && (
        <View style={styles.scannerOverlay}>
          <CameraView ref={ingredientsCameraRef} style={StyleSheet.absoluteFillObject} facing="back" />
          <View style={styles.scannerFooter}>
            <Text style={styles.scannerTitle}>Take a photo of the ingredients</Text>
            <Text style={styles.scannerText}>Fill the screen with the ingredients list, then capture.</Text>
            <View style={styles.footerButtonsRow}>
              <Pressable onPress={() => setIngredientsScannerVisible(false)} style={[styles.footerButton, styles.footerButtonSecondary]}>
                <Text style={styles.footerButtonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={captureIngredientsPhoto} style={[styles.footerButton, styles.footerButtonPrimary]}>
                <Text style={{...styles.footerButtonText, color: colors.background}}>Capture</Text>
              </Pressable>
            </View>
          </View>

          {namePromptVisible && (
            <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }]}> 
              <View style={{ width: '85%', borderRadius: 16, marginBottom: 75, padding: 16, backgroundColor: colors.surface }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Name this scan</Text>
                <Text style={{ marginTop: 6, fontSize: 13, color: colors.muted }}>Give this item a name so you can recognise it in your history.</Text>
                <TextInput
                  style={{ marginTop: 12, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 8, color: colors.text, backgroundColor: colors.background }}
                  placeholder="e.g. Cereal box, Chips packet"
                  placeholderTextColor={colors.muted}
                  value={itemNameDraft}
                  onChangeText={setItemNameDraft}
                  autoFocus
                />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
                  <Pressable onPress={handleCancelItemName} style={{ paddingVertical: 8, paddingHorizontal: 12, marginRight: 8 }}>
                    <Text style={{ color: colors.muted, fontSize: 14 }}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={handleConfirmItemName} style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, backgroundColor: colors.primary }}>
                    <Text style={{ color: colors.background, fontSize: 14, fontWeight: '700' }}>Continue</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}