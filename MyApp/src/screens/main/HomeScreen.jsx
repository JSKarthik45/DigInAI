import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextRecognition } from '@react-native-ml-kit/text-recognition';
import { useThemeColors, useThemedStyles } from '../../theme/ThemeContext';
import { typography } from '../../theme';
import CircleButton from '../../components/CircleButton';

const styleFactory = (colors) => StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingVertical: 16, backgroundColor: colors.background },
  title: { ...typography.title, marginBottom: 8 },
  subtitle: { ...typography.subtitle, marginBottom: 12 },
  body: { ...typography.body, marginBottom: 8 },
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
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.muted,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
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
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  card: {
    width: '100%',
    borderRadius: 14,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  bodyBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bodyBulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 8,
    marginRight: 8,
  },
  bodyBulletText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
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
  const pulseAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

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

  const recognizeIngredientsFromImage = async (uri) => {
    try {
      const result = await TextRecognition.recognize(uri);

      if (!result) {
        return '';
      }

      // Many ML Kit wrappers return blocks/lines; flatten into a single string.
      if (Array.isArray(result.blocks)) {
        const lines = result.blocks.flatMap((block) => block.lines || []);
        const text = lines.map((line) => line.text || '').join('\n');
        return text.trim();
      }

      // Fallback if the wrapper exposes a top-level text field.
      if (typeof result.text === 'string') {
        return result.text.trim();
      }

      return '';
    } catch (err) {
      console.log('ML Kit text recognition error', err);
      return '';
    }
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
              Scan a product barcode. This works best for packaged foods with clear barcodes.
            </Text>
            <View style={[styles.card, { marginTop: 8 }]}>            
              <View style={styles.bodyBulletRow}>
                <View style={styles.bodyBulletDot} />
                <Text style={styles.bodyBulletText}>Hold the barcode 10–20 cm from the camera so the lines are sharp.</Text>
              </View>
              <View style={styles.bodyBulletRow}>
                <View style={styles.bodyBulletDot} />
                <Text style={styles.bodyBulletText}>Center the entire barcode inside the frame and avoid glare or reflections.</Text>
              </View>
              <View style={styles.bodyBulletRow}>
                <View style={styles.bodyBulletDot} />
                <Text style={styles.bodyBulletText}>We’ll look it up in Open Food Facts and show the full breakdown on the Analyse tab.</Text>
              </View>
            </View>
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
            <View style={[styles.card, { marginTop: 8 }]}>            
              <View style={styles.bodyBulletRow}>
                <View style={styles.bodyBulletDot} />
                <Text style={styles.bodyBulletText}>Lay the package flat and tilt it until reflections disappear.</Text>
              </View>
              <View style={styles.bodyBulletRow}>
                <View style={styles.bodyBulletDot} />
                <Text style={styles.bodyBulletText}>Fill the frame with the full ingredients paragraph, edge to edge.</Text>
              </View>
              <View style={styles.bodyBulletRow}>
                <View style={styles.bodyBulletDot} />
                <Text style={styles.bodyBulletText}>We’ll run on-device text recognition and show the results on the Analyse tab.</Text>
              </View>
            </View>
            {ingredientsProcessing && (
              <Text style={styles.subtitle}>Analyzing ingredients photo…</Text>
            )}
          </>
        )}
      </View>

      <Animated.View
        style={[
          styles.fab,
          {
            transform: [
              {
                scale: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.05],
                }),
              },
              {
                rotate: pulseAnim.interpolate({
                  inputRange: [0, 0.25, 0.5, 0.75, 1],
                  outputRange: ['-3deg', '0deg', '3deg', '0deg', '-3deg'],
                }),
              },
            ],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
          },
        ]}
      >
        <CircleButton
          icon="add"
          size={62}
          backgroundColor={colors.primary}
          onPress={mode === 'barcode' ? openScanner : openIngredientsScanner}
        />
      </Animated.View>

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
