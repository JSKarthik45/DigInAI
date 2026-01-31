import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';
import { useThemeColors } from '../../theme/ThemeContext';

/**
 * Scanner overlay with camera view and corner frame
 */
export default function ScannerOverlay({
  cameraRef,
  type = 'barcode', // 'barcode' | 'ingredients'
  onBarcodeScanned,
  footer,
  children,
  style,
}) {
  const colors = useThemeColors();

  return (
    <View style={[styles.overlay, style]}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={type === 'barcode' ? { barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr'] } : undefined}
        onBarcodeScanned={type === 'barcode' ? onBarcodeScanned : undefined}
      />
      
      {type === 'barcode' && (
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <View style={styles.scannerFrame}>
            <View style={styles.frameInner}>
              <View style={[styles.corner, styles.cornerTopLeft, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.cornerTopRight, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.cornerBottomLeft, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.cornerBottomRight, { borderColor: colors.primary }]} />
            </View>
          </View>
        </View>
      )}
      
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        {footer}
      </View>
      
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  scannerFrame: {
    position: 'absolute',
    top: '16%',
    left: 32,
    right: 32,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameInner: {
    width: '100%',
    height: '100%',
  },
  corner: {
    position: 'absolute',
    width: 80,
    height: 60,
    borderRadius: 10,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 10,
    borderLeftWidth: 10,
    borderTopLeftRadius: 20,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 10,
    borderRightWidth: 10,
    borderTopRightRadius: 20,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 10,
    borderLeftWidth: 10,
    borderBottomLeftRadius: 20,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 10,
    borderRightWidth: 10,
    borderBottomRightRadius: 20,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
});
