import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VideoView } from 'expo-video';
import { useThemeColors } from '../../theme/ThemeContext';

export default function OnboardingDemoPage({ player, width, style }) {
  const colors = useThemeColors();

  return (
    <View style={[styles.page, { width, backgroundColor: colors.background }, style]}>
      <View style={[styles.videoContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <VideoView
          style={styles.video}
          player={player}
          fullscreenOptions={{}}
          contentFit="cover"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 90,
  },
  videoContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  video: {
    width: '100%',
    height: 450,
  },
});
