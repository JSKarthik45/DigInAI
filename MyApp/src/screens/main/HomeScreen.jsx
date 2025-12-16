import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Image, PanResponder, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
    scanButtonText: { marginTop: 8, fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
    subtitleCentered: { fontSize: 14, color: colors.muted, textAlign: 'center', paddingHorizontal: 24 },
    bottomBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 8, paddingBottom: 4, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.background },
    bottomItem: { alignItems: 'center', justifyContent: 'center' },
    bottomLabel: { fontSize: 12, marginTop: 2, color: colors.muted },
    bottomLabelActive: { color: colors.primary },

    /* scanner/crop styles (kept from original) */
    scannerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
    scannerFrame: { position: 'absolute', top: '16%', left: 32, right: 32, height: 220, justifyContent: 'center', alignItems: 'center' },
    scannerFrameInner: { width: '100%', height: '100%' },
    scannerCorner: { position: 'absolute', width: 40, height: 40, borderColor: colors.secondary, borderRadius: 4 },
    scannerCornerTopLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
    scannerCornerTopRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
    scannerCornerBottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
    scannerCornerBottomRight: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
    scannerFooter: { paddingHorizontal: 16, paddingVertical: 20, backgroundColor: colors.surface },
    scannerTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6, color: colors.secondary },
    scannerText: { fontSize: 14, color: colors.muted },

    cropOverlayContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 32 },
    cropImageContainer: { position: 'relative', overflow: 'hidden', borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: '#000' },
    capturedImage: { width: '100%', height: '100%' },
    cropRect: { position: 'absolute', borderWidth: 2, borderColor: colors.secondary, backgroundColor: 'rgba(15,23,42,0.15)' },
    cropInfoText: { marginTop: 16, textAlign: 'center', fontSize: 14, color: colors.muted },
    cropButtonsRow: { flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', width: '100%' },
    cropButton: { flex: 1, paddingVertical: 10, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    cropButtonSecondary: { marginRight: 8, backgroundColor: 'transparent' },
    cropButtonPrimary: { marginLeft: 8, backgroundColor: colors.primary },
    cropButtonText: { fontSize: 14, fontWeight: '600', color: colors.text },
    cropHandle: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: colors.secondary, borderWidth: 2, borderColor: colors.background },
    ctaContent: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  });

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const MIN_CROP_WIDTH = 80;
const MIN_CROP_HEIGHT = 60;
const HISTORY_KEY = 'scan_history_v1';

export default function HomeScreen() {
  const styles = useThemedStyles(styleFactory);
  const colors = useThemeColors();
  const navigation = useNavigation();

  const [mode, setMode] = useState('barcode');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState(null);
  const [productData, setProductData] = useState(null);
  

  const [ingredientsScannerVisible, setIngredientsScannerVisible] = useState(false);
  const ingredientsCameraRef = useRef(null);
  const [ingredientsText, setIngredientsText] = useState(null);
  const [ingredientsProcessing, setIngredientsProcessing] = useState(false);

  const [capturedImage, setCapturedImage] = useState(null);
  const [cropImageLayout, setCropImageLayout] = useState(null);
  const [cropRect, setCropRect] = useState(null);
  const cropImageLayoutRef = useRef(null);
  const cropRectRef = useRef(null);
  const scanningRef = useRef(true);

 

  const panStartRef = useRef({ x: 0, y: 0 });
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2,
      onPanResponderGrant: () => {
        if (cropRectRef.current) panStartRef.current = { x: cropRectRef.current.x, y: cropRectRef.current.y };
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!cropRectRef.current || !cropImageLayoutRef.current) return;
        const currentRect = cropRectRef.current;
        const layout = cropImageLayoutRef.current;
        const maxX = Math.max(0, layout.width - currentRect.width);
        const maxY = Math.max(0, layout.height - currentRect.height);
        const newX = clamp(panStartRef.current.x + gestureState.dx, 0, maxX);
        const newY = clamp(panStartRef.current.y + gestureState.dy, 0, maxY);
        setCropRect((prev) => {
          if (!prev) return prev;
          const next = { ...prev, x: newX, y: newY };
          cropRectRef.current = next;
          return next;
        });
      },
    })
  ).current;

  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const createResizeResponder = (corner) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        if (cropRectRef.current) resizeStartRef.current = { x: cropRectRef.current.x, y: cropRectRef.current.y, width: cropRectRef.current.width, height: cropRectRef.current.height };
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!cropRectRef.current || !cropImageLayoutRef.current) return;
        const { dx, dy } = gestureState;
        const start = resizeStartRef.current;
        const layout = cropImageLayoutRef.current;
        let x = start.x;
        let y = start.y;
        let width = start.width;
        let height = start.height;
        if (corner === 'topLeft') {
          x = clamp(start.x + dx, 0, start.x + start.width - MIN_CROP_WIDTH);
          y = clamp(start.y + dy, 0, start.y + start.height - MIN_CROP_HEIGHT);
          width = clamp(start.width + (start.x - x), MIN_CROP_WIDTH, layout.width - x);
          height = clamp(start.height + (start.y - y), MIN_CROP_HEIGHT, layout.height - y);
        } else if (corner === 'topRight') {
          x = start.x;
          y = clamp(start.y + dy, 0, start.y + start.height - MIN_CROP_HEIGHT);
          height = clamp(start.height + (start.y - y), MIN_CROP_HEIGHT, layout.height - y);
          width = clamp(start.width + dx, MIN_CROP_WIDTH, layout.width - start.x);
        } else if (corner === 'bottomLeft') {
          y = start.y;
          x = clamp(start.x + dx, 0, start.x + start.width - MIN_CROP_WIDTH);
          width = clamp(start.width + (start.x - x), MIN_CROP_WIDTH, layout.width - x);
          height = clamp(start.height + dy, MIN_CROP_HEIGHT, layout.height - start.y);
        } else if (corner === 'bottomRight') {
          x = start.x;
          y = start.y;
          width = clamp(start.width + dx, MIN_CROP_WIDTH, layout.width - start.x);
          height = clamp(start.height + dy, MIN_CROP_HEIGHT, layout.height - start.y);
        }
        const next = { x, y, width, height };
        cropRectRef.current = next;
        setCropRect(next);
      },
    });

  const topLeftResponder = useRef(createResizeResponder('topLeft')).current;
  const topRightResponder = useRef(createResizeResponder('topRight')).current;
  const bottomLeftResponder = useRef(createResizeResponder('bottomLeft')).current;
  const bottomRightResponder = useRef(createResizeResponder('bottomRight')).current;

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
    setScannedData({ type, data });
    setScannerVisible(false);
    const barcode = data;
    const createdAt = new Date().toISOString();
    const parentNav = navigation.getParent?.();
    if (parentNav) {
      parentNav.navigate('Analyse', { source: 'barcode', barcode, createdAt });
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
      console.log('ML Kit text recognition error', err);
      return '';
    }
  };

  const runIngredientsOcrFlow = async (uri) => {
    try {
      setIngredientsProcessing(true);
      const text = await recognizeIngredientsFromImage(uri);
      setIngredientsText(text);
      const parentNav = navigation.getParent?.();
      if (parentNav) {
        parentNav.navigate('Analyse', { source: 'ingredients', ingredientsText: text });
      }
    } catch (err) {
      console.log('Error capturing or processing ingredients photo', err);
    } finally {
      setIngredientsProcessing(false);
    }
  };

  const handleConfirmCrop = async () => {
    if (!capturedImage || !cropRect || !cropImageLayout) return;
    try {
      const scaleX = capturedImage.width / cropImageLayout.width;
      const scaleY = capturedImage.height / cropImageLayout.height;
      const cropData = { originX: Math.max(0, Math.round(cropRect.x * scaleX)), originY: Math.max(0, Math.round(cropRect.y * scaleY)), width: Math.round(cropRect.width * scaleX), height: Math.round(cropRect.height * scaleY) };
      const cropped = await ImageManipulator.manipulateAsync(capturedImage.uri, [{ crop: cropData }], { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG });
      const uriToProcess = cropped?.uri || capturedImage.uri;
      setCapturedImage(null);
      setCropImageLayout(null);
      setCropRect(null);
      await runIngredientsOcrFlow(uriToProcess);
    } catch (err) {
      console.log('Error cropping image with ImageManipulator', err);
      setCapturedImage(null);
      setCropImageLayout(null);
      setCropRect(null);
      await runIngredientsOcrFlow(capturedImage.uri);
    }
  };

  const handleCancelCrop = () => {
    setCapturedImage(null);
    setCropImageLayout(null);
    setCropRect(null);
    setIngredientsScannerVisible(true);
  };

  const captureIngredientsPhoto = async () => {
    if (!ingredientsCameraRef.current) return;
    try {
      const photo = await ingredientsCameraRef.current.takePictureAsync({ quality: 0.8, base64: false });
      setIngredientsScannerVisible(false);
      const screenWidth = Dimensions.get('window').width;
      const imageWidth = screenWidth - 32;
      const aspectRatio = photo.height && photo.width ? photo.height / photo.width : 1;
      const imageHeight = imageWidth * aspectRatio;
      const rectWidth = imageWidth * 0.9;
      const rectHeight = imageHeight * 0.4;
      const layout = { width: imageWidth, height: imageHeight };
      const initialRect = { x: (imageWidth - rectWidth) / 2, y: (imageHeight - rectHeight) / 2, width: rectWidth, height: rectHeight };
      cropImageLayoutRef.current = layout;
      cropRectRef.current = initialRect;
      setCropImageLayout(layout);
      setCropRect(initialRect);
      setCapturedImage({ uri: photo.uri, width: photo.width, height: photo.height });
    } catch (err) {
      console.log('Error capturing or processing ingredients photo', err);
    }
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
              <Ionicons name={mode === 'barcode' ? 'scan' : 'document-text'} size={76} color="#fff" />
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
          <CameraView style={StyleSheet.absoluteFillObject} facing="back" barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr'] }} onBarcodeScanned={handleBarCodeScanned} />
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
            <Pressable onPress={() => { setScannerVisible(false); scanningRef.current = true; }} style={[styles.cropButton, styles.cropButtonPrimary]}>
              <Text style={styles.cropButtonText}>Close</Text>
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
            <View style={styles.cropButtonsRow}>
              <Pressable onPress={() => setIngredientsScannerVisible(false)} style={[styles.cropButton, styles.cropButtonSecondary]}>
                <Text style={styles.cropButtonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={captureIngredientsPhoto} style={[styles.cropButton, styles.cropButtonPrimary]}>
                <Text style={styles.cropButtonText}>Capture</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {capturedImage && cropImageLayout && cropRect && (
        <View style={styles.scannerOverlay}>
          <View style={styles.cropOverlayContent}>
            <View style={[styles.cropImageContainer, { width: cropImageLayout.width, height: cropImageLayout.height }]}> 
              <Image source={{ uri: capturedImage.uri }} style={styles.capturedImage} resizeMode="contain" />
              <View style={[styles.cropRect, { left: cropRect.x, top: cropRect.y, width: cropRect.width, height: cropRect.height }]}> 
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} {...panResponder.panHandlers} />
                <View style={[styles.cropHandle, { left: -10, top: -10 }]} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} {...topLeftResponder.panHandlers} />
                <View style={[styles.cropHandle, { right: -10, top: -10 }]} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} {...topRightResponder.panHandlers} />
                <View style={[styles.cropHandle, { left: -10, bottom: -10 }]} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} {...bottomLeftResponder.panHandlers} />
                <View style={[styles.cropHandle, { right: -10, bottom: -10 }]} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} {...bottomRightResponder.panHandlers} />
              </View>
            </View>
            <Text style={styles.cropInfoText}>Crop the image to only include the ingredients section.</Text>
            <View style={styles.cropButtonsRow}>
              <Pressable onPress={handleCancelCrop} style={[styles.cropButton, styles.cropButtonSecondary]}><Text style={styles.cropButtonText}>Retake</Text></Pressable>
              <Pressable onPress={handleConfirmCrop} style={[styles.cropButton, styles.cropButtonPrimary]}><Text style={styles.cropButtonText}>Done</Text></Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}