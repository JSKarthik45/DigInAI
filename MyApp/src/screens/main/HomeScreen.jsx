import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, useThemedStyles } from '../../theme/ThemeContext';

// Components
import { ScanModeTabBar, ScanButton, ItemNamePrompt } from '../../components/home';

const HISTORY_KEY = 'scan_history_v1';

const styleFactory = (colors) =>
  StyleSheet.create({
    container: { 
      flex: 1, 
      paddingHorizontal: 16, 
      paddingVertical: 16, 
      backgroundColor: colors.background 
    },
    centerContent: { 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center' 
    },
    scanButton: { 
      width: 220, 
      height: 220, 
      borderRadius: 110, 
      alignItems: 'center', 
      justifyContent: 'center', 
      marginBottom: 16, 
      overflow: 'hidden' 
    },
    scanButtonText: { 
      marginTop: 8, 
      fontSize: 18, 
      fontWeight: '800', 
      color: colors.background, 
      letterSpacing: 1.5 
    },
    subtitleCentered: { 
      fontSize: 14, 
      color: colors.muted, 
      textAlign: 'center', 
      paddingHorizontal: 24 
    },
    processingText: {
      fontSize: 14,
      color: colors.muted,
      textAlign: 'center',
      marginTop: 8,
    },
    ctaContent: { 
      width: '100%', 
      height: '100%', 
      alignItems: 'center', 
      justifyContent: 'center' 
    },
    /* Scanner overlay styles */
    scannerOverlay: { 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.9)', 
      justifyContent: 'flex-end' 
    },
    scannerFrame: { 
      position: 'absolute', 
      top: '16%', 
      left: 32, 
      right: 32, 
      height: 220, 
      justifyContent: 'center', 
      alignItems: 'center' 
    },
    scannerFrameInner: { 
      width: '100%', 
      height: '100%' 
    },
    scannerCorner: { 
      position: 'absolute', 
      width: 80, 
      height: 60, 
      borderColor: colors.primary, 
      borderRadius: 10 
    },
    scannerCornerTopLeft: { 
      top: 0, 
      left: 0, 
      borderTopWidth: 10, 
      borderLeftWidth: 10, 
      borderTopLeftRadius: 20 
    },
    scannerCornerTopRight: { 
      top: 0, 
      right: 0, 
      borderTopWidth: 10, 
      borderRightWidth: 10, 
      borderTopRightRadius: 20 
    },
    scannerCornerBottomLeft: { 
      bottom: 0, 
      left: 0, 
      borderBottomWidth: 10, 
      borderLeftWidth: 10, 
      borderBottomLeftRadius: 20 
    },
    scannerCornerBottomRight: { 
      bottom: 0, 
      right: 0, 
      borderBottomWidth: 10, 
      borderRightWidth: 10, 
      borderBottomRightRadius: 20 
    },
    scannerFooter: { 
      paddingHorizontal: 16, 
      paddingVertical: 20, 
      backgroundColor: colors.surface 
    },
    scannerTitle: { 
      fontSize: 18, 
      fontWeight: '700', 
      marginBottom: 6, 
      color: colors.primary 
    },
    scannerText: { 
      fontSize: 14, 
      color: colors.muted 
    },
    footerButtonsRow: { 
      flexDirection: 'row', 
      marginTop: 20, 
      justifyContent: 'space-between', 
      width: '100%' 
    },
    footerButton: { 
      flex: 1, 
      paddingVertical: 12, 
      borderRadius: 999, 
      alignItems: 'center', 
      justifyContent: 'center' 
    },
    footerButtonSecondary: { 
      marginRight: 8, 
      backgroundColor: colors.background 
    },
    footerButtonPrimary: { 
      marginLeft: 8, 
      backgroundColor: colors.primary 
    },
    footerButtonText: { 
      fontSize: 14, 
      fontWeight: '600', 
      color: colors.text 
    },
    footerButtonTextPrimary: { 
      fontSize: 14, 
      fontWeight: '600', 
      color: colors.background 
    },
    cancelButton: { 
      paddingVertical: 12, 
      borderRadius: 999, 
      alignItems: 'center', 
      justifyContent: 'center', 
      marginTop: 20, 
      backgroundColor: colors.background 
    },
    cancelButtonText: { 
      fontSize: 14, 
      fontWeight: '600', 
      color: colors.text 
    },
  });

export default function HomeScreen() {
  const styles = useThemedStyles(styleFactory);
  const colors = useThemeColors();
  const navigation = useNavigation();
  const route = useRoute();

  // State
  const [mode, setMode] = useState('barcode');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [ingredientsScannerVisible, setIngredientsScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState(null);
  const [ingredientsProcessing, setIngredientsProcessing] = useState(false);
  const [namePromptVisible, setNamePromptVisible] = useState(false);
  const [itemNameDraft, setItemNameDraft] = useState('');
  const [pendingIngredients, setPendingIngredients] = useState(null);

  // Refs
  const ingredientsCameraRef = useRef(null);
  const barcodeCameraRef = useRef(null);
  const scanningRef = useRef(true);

  // Reset overlays on focus
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
    
    const parentNav = navigation.getParent?.();
    if (parentNav) {
      parentNav.navigate('Analyse', { 
        source: 'barcode', 
        barcode: data, 
        createdAt: new Date().toISOString(), 
        thumbnail: thumbnailUri 
      });
    }
  };

  const recognizeIngredientsFromImage = async (uri) => {
    try {
      const result = await TextRecognition.recognize(uri);
      if (!result) return '';
      if (Array.isArray(result.blocks)) {
        const lines = result.blocks.flatMap((block) => block.lines || []);
        return lines.map((line) => line.text || '').join('\n').trim();
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

  const scanHintText = mode === 'barcode' 
    ? 'Point camera at the product barcode to identify harmful additives.'
    : 'Point camera at the ingredients list to identify harmful additives.';

  return (
    <View style={styles.container}>
      <ScanModeTabBar mode={mode} onModeChange={setMode} />

      <View style={styles.centerContent}>
        <View>
          <Pressable 
            style={styles.scanButton} 
            onPress={mode === 'barcode' ? openScanner : openIngredientsScanner}
          >
            <View 
              pointerEvents="none" 
              style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.primary, borderRadius: 110 }]} 
            />
            <View style={styles.ctaContent}>
              <Ionicons 
                name={mode === 'barcode' ? 'scan' : 'document-text'} 
                size={76} 
                color={colors.background} 
              />
              <Text style={styles.scanButtonText}>TAP TO SCAN</Text>
            </View>
          </Pressable>
        </View>
        <Text style={styles.subtitleCentered}>{scanHintText}</Text>
        {mode === 'ingredients' && ingredientsProcessing && (
          <Text style={styles.processingText}>Analyzing ingredients photo…</Text>
        )}
      </View>

      {/* Barcode Scanner Overlay */}
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
              <Text style={styles.scannerText}>
                Point your camera at a product barcode to see its details.
              </Text>
            )}
            <Pressable 
              onPress={() => { setScannerVisible(false); scanningRef.current = true; }} 
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Ingredients Scanner Overlay */}
      {ingredientsScannerVisible && (
        <View style={styles.scannerOverlay}>
          <CameraView 
            ref={ingredientsCameraRef} 
            style={StyleSheet.absoluteFillObject} 
            facing="back" 
          />
          <View style={styles.scannerFooter}>
            <Text style={styles.scannerTitle}>Take a photo of the ingredients</Text>
            <Text style={styles.scannerText}>
              Fill the screen with the ingredients list, then capture.
            </Text>
            <View style={styles.footerButtonsRow}>
              <Pressable 
                onPress={() => setIngredientsScannerVisible(false)} 
                style={[styles.footerButton, styles.footerButtonSecondary]}
              >
                <Text style={styles.footerButtonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                onPress={captureIngredientsPhoto} 
                style={[styles.footerButton, styles.footerButtonPrimary]}
              >
                <Text style={styles.footerButtonTextPrimary}>Capture</Text>
              </Pressable>
            </View>
          </View>

          <ItemNamePrompt
            visible={namePromptVisible}
            value={itemNameDraft}
            onChangeText={setItemNameDraft}
            onConfirm={handleConfirmItemName}
            onCancel={handleCancelItemName}
          />
        </View>
      )}
    </View>
  );
}
