import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme/ThemeContext';

/**
 * Modal dialog for naming scanned items
 */
export default function ItemNamePrompt({
  visible,
  value,
  onChangeText,
  onConfirm,
  onCancel,
}) {
  const colors = useThemeColors();

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Name this scan</Text>
        <Text style={[styles.description, { color: colors.muted }]}>
          Give this item a name so you can recognise it in your history.
        </Text>
        <TextInput
          style={[styles.input, { 
            borderColor: colors.border, 
            color: colors.text, 
            backgroundColor: colors.background 
          }]}
          placeholder="e.g. Cereal box, Chips packet"
          placeholderTextColor={colors.muted}
          value={value}
          onChangeText={onChangeText}
          autoFocus
        />
        <View style={styles.buttons}>
          <Pressable onPress={onCancel} style={styles.cancelButton}>
            <Text style={[styles.cancelText, { color: colors.muted }]}>Cancel</Text>
          </Pressable>
          <Pressable onPress={onConfirm} style={[styles.confirmButton, { backgroundColor: colors.primary }]}>
            <Text style={[styles.confirmText, { color: colors.background }]}>Continue</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  container: {
    width: '85%',
    borderRadius: 16,
    marginBottom: 75,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    marginTop: 6,
    fontSize: 13,
  },
  input: {
    marginTop: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  cancelText: {
    fontSize: 14,
  },
  confirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
