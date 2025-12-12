import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColors, useThemedStyles } from '../../theme/ThemeContext';
import CircleButton from '../../components/CircleButton';

const styleFactory = (colors) => StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingVertical: 16, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.muted, textAlign: 'center', marginBottom: 12 },
  tabBar: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  tabActive: {
    backgroundColor: colors.surface,
  },
  tabText: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  scannerFooter: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  scannerTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6, color: colors.secondary },
  scannerText: { fontSize: 14, color: colors.muted },
  scannerButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  scannerButtonText: { color: colors.secondary, fontWeight: '600' },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});

export default function HomeScreen() {
  const styles = useThemedStyles(styleFactory);
  const colors = useThemeColors();
  const navigation = useNavigation();
  const [mode, setMode] = useState('barcode'); // 'barcode' | 'ingredients'
  const [scannerVisible, setScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState(null);
  const [ingredientsScannerVisible, setIngredientsScannerVisible] = useState(false);
  const ingredientsCameraRef = useRef(null);
  const [ingredientsText, setIngredientsText] = useState(null);
  const [ingredientsProcessing, setIngredientsProcessing] = useState(false);
  const scanningRef = useRef(true);

  const HISTORY_KEY = 'scan_history_v1';

  const appendHistoryEntry = async (entry) => {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const updated = [{ id: Date.now().toString(), ...entry }, ...list];
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (err) {
      console.log('Error updating history', err);
    }
  };

  const openScanner = async () => {
    const granted = permission?.granted ?? false;
    if (!granted) {
      const req = await requestPermission();
      if (!req.granted) {
        return;
      }
    }
    scanningRef.current = true;
    setScannedData(null);
    setScannerVisible(true);
  };

  const openIngredientsScanner = async () => {
    const granted = permission?.granted ?? false;
    if (!granted) {
      const req = await requestPermission();
      if (!req.granted) {
        return;
      }
    }
    setIngredientsText(null);
    setIngredientsScannerVisible(true);
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (!scanningRef.current) return;
    scanningRef.current = false;
    setScannedData({ type, data });
    // Close the camera overlay and return to Home after a successful scan
    setScannerVisible(false);

    const barcode = data;
    setProductLoading(true);
    setProductError(null);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const apiData = await response.json();
      setProductData(apiData);

      await appendHistoryEntry({
        type: 'barcode',
        barcode,
        createdAt: new Date().toISOString(),
      });

      // After fetching data, go to Analyse tab with all info
      navigation.navigate('Analyse', {
        source: 'barcode',
        barcode,
        productData: apiData,
      });
    } catch (err) {
      console.log('Error fetching product data', err);
      setProductError('Could not load product details.');
      setProductData(null);
    } finally {
      setProductLoading(false);
    }
  };

  // Placeholder for Google ML Kit OCR integration.
  const recognizeIngredientsFromImage = async (uri) => {
    // TODO: Integrate Google ML Kit Text Recognition via native module.
    // For now, return a placeholder string so the flow works.
    return 'Detected ingredients text from photo (connect Google ML Kit here).';
  };

  const captureIngredientsPhoto = async () => {
    if (!ingredientsCameraRef.current) return;
    try {
      setIngredientsProcessing(true);
      const photo = await ingredientsCameraRef.current.takePictureAsync({ quality: 0.8, base64: false });
      setIngredientsScannerVisible(false);
      const text = await recognizeIngredientsFromImage(photo.uri);
      setIngredientsText(text);
      await appendHistoryEntry({
        type: 'ingredients',
        ingredientsText: text,
        createdAt: new Date().toISOString(),
      });
      navigation.navigate('Analyse', {
        source: 'ingredients',
        ingredientsText: text,
      });
    } catch (err) {
      console.log('Error capturing or processing ingredients photo', err);
    } finally {
      setIngredientsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, mode === 'barcode' && styles.tabActive]}
          onPress={() => setMode('barcode')}
        >
          <Text style={[styles.tabText, mode === 'barcode' && styles.tabTextActive]}>Barcode</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, mode === 'ingredients' && styles.tabActive]}
          onPress={() => setMode('ingredients')}
        >
          <Text style={[styles.tabText, mode === 'ingredients' && styles.tabTextActive]}>Ingredients</Text>
        </Pressable>
      </View>

      <View style={styles.centerContent}>
        {mode === 'barcode' ? (
          <>
            <Text style={styles.subtitle}>
              Scan a product barcode to fetch its details from Open Food Facts. This works best for packaged foods with clear barcodes.
            </Text>
            <Text style={styles.subtitle}>
              • Hold the barcode 10–20 cm from the camera.
            </Text>
            <Text style={styles.subtitle}>
              • Make sure the whole barcode is inside the frame and in focus.
            </Text>
            <Text style={styles.subtitle}>
              • Well look up the product in Open Food Facts and show the full analysis on the Analyse tab.
            </Text>
            {productLoading && (
              <Text style={styles.subtitle}>Looking up this product…</Text>
            )}
            {productError && (
              <Text style={[styles.subtitle, { color: colors.secondary }]}>{productError}</Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Take a clear photo of the ingredients list so we can read it directly from the label.
            </Text>
            <Text style={styles.subtitle}>
              • Lay the package flat and avoid glare or reflections.
            </Text>
            <Text style={styles.subtitle}>
              • Make sure the entire ingredients paragraph is visible in the frame.
            </Text>
            <Text style={styles.subtitle}>
              • Well run on-device text recognition and show the results on the Analyse tab.
            </Text>
            {ingredientsProcessing && (
              <Text style={styles.subtitle}>Analyzing ingredients photo…</Text>
            )}
          </>
        )}
      </View>

      <CircleButton
        icon="add"
        size={58}
        backgroundColor={colors.primary}
        onPress={mode === 'barcode' ? openScanner : openIngredientsScanner}
        style={styles.fab}
      />

      {scannerVisible && (
        <View style={styles.scannerOverlay}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr'] }}
            onBarcodeScanned={handleBarCodeScanned}
          />
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
            <Pressable onPress={() => { setScannerVisible(false); scanningRef.current = true; }} style={styles.scannerButton}>
              <Text style={styles.scannerButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      )}

      {ingredientsScannerVisible && (
        <View style={styles.scannerOverlay}>
          <CameraView
            ref={ingredientsCameraRef}
            style={StyleSheet.absoluteFillObject}
            facing="back"
          />
          <View style={styles.scannerFooter}>
            <Text style={styles.scannerTitle}>Take a photo of the ingredients</Text>
            <Text style={styles.scannerText}>Fill the screen with the ingredients list, then capture.</Text>
            <Pressable onPress={captureIngredientsPhoto} style={styles.scannerButton}>
              <Text style={styles.scannerButtonText}>Capture</Text>
            </Pressable>
            <Pressable onPress={() => setIngredientsScannerVisible(false)} style={[styles.scannerButton, { marginTop: 8 }]}>
              <Text style={styles.scannerButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
