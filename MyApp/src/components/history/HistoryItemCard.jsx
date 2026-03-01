import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme/ThemeContext';

/**
 * History item card with swipe to delete
 */
export default function HistoryItemCard({
  item,
  onPress,
  onDelete,
  cardColor,
}) {
  const colors = useThemeColors();
  const bgColor = cardColor?.bg || colors.surface;

  const renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0.8],
      extrapolate: 'clamp',
    });
    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View style={[styles.deleteAction, { opacity, transform: [{ scale }] }]}>
        <Ionicons name="trash" size={30} color="#fff" />
      </Animated.View>
    );
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  const displayName = item.type === 'barcode' 
    ? item.productName || 'Barcode scan' 
    : item.itemName || 'Ingredients scan';

  // Determine text color for readability on card background
  const cardTextColor = cardColor?.text || colors.text;
  const cardSubtextColor = cardColor?.text 
    ? `${cardColor.text}99` 
    : colors.muted;

  return (
    <View style={styles.container}>
      <Swipeable
        overshootRight={false}
        renderRightActions={renderRightActions}
        onSwipeableRightOpen={() => onDelete(item.id)}
      >
        <Pressable 
          onPress={() => onPress(item)} 
          style={[styles.card, { backgroundColor: bgColor, borderColor: colors.border }]}
        >
          <View style={styles.row}>
            {item.thumbnail ? (
              <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            ) : (
              <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                <Ionicons 
                  name={item.type === 'barcode' ? 'barcode-outline' : 'document-text-outline'} 
                  size={24} 
                  color={cardSubtextColor} 
                />
              </View>
            )}
            <View style={styles.content}>
              <Text style={[styles.productName, { color: cardTextColor }]} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={[styles.dateText, { color: cardSubtextColor }]}>{formatDate(item.createdAt)}</Text>
              {item.healthLabel && (
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                    <Text style={[styles.badgeText, { color: cardTextColor }]}>
                      {item.healthLabel}
                    </Text>
                  </View>
                </View>
              )}
              {item.colorCodes && item.colorCodes.length > 0 ? (
                <Text numberOfLines={1} style={[styles.subtitle, { color: cardSubtextColor }]}>
                  {item.colorCodes.join(', ')}
                </Text>
              ) : null}
            </View>
            <View style={styles.indicator}>
              <Ionicons name="chevron-forward" size={30} color={`${cardTextColor}66`} />
            </View>
          </View>
        </Pressable>
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  card: {
    width: '100%',
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  thumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 13,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  indicator: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteAction: {
    width: 72,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 12,
  },
});
