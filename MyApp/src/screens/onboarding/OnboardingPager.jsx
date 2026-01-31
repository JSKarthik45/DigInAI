import React, { useRef, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Animated, TouchableOpacity, Text } from 'react-native';
import { useVideoPlayer } from 'expo-video';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import CircleButton from '../../components/CircleButton';
import { OnboardingContext } from '../../navigation/OnboardingContext';
import { useThemeColors, useThemedStyles } from '../../theme/ThemeContext';
import {
  OnboardingProblemPage,
  OnboardingSolutionPage,
  OnboardingMotivationPage,
  OnboardingPricingPage,
  OnboardingDemoPage,
} from '../../components/onboarding';

const { width } = Dimensions.get('window');

const PAGES = [
  { key: 'problem' },
  { key: 'solution' },
  { key: 'demo' },
  { key: 'motivation' },
  { key: 'pricing' },
];

const styleFactory = (colors) => StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: colors.background,
  },
  dots: {
    position: 'absolute',
    bottom: 96,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  fab: {
    position: 'absolute',
    right: 24,
  },
  ctaWrap: {
    position: 'absolute',
    left: 24,
    right: 24,
  },
  ctaButton: {
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default function OnboardingPager() {
  const colors = useThemeColors();
  const styles = useThemedStyles(styleFactory);
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);
  const { completeOnboarding } = useContext(OnboardingContext);

  // Video player for demo page
  const demoPlayer = useVideoPlayer(
    'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    (player) => {
      player.loop = true;
    }
  );

  // Floating animations
  const floatA = useRef(new Animated.Value(0)).current;
  const floatB = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animationA = Animated.loop(
      Animated.sequence([
        Animated.timing(floatA, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(floatA, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    );
    const animationB = Animated.loop(
      Animated.sequence([
        Animated.timing(floatB, { toValue: 1, duration: 2600, useNativeDriver: true }),
        Animated.timing(floatB, { toValue: 0, duration: 2600, useNativeDriver: true }),
      ])
    );
    animationA.start();
    animationB.start();
    
    return () => {
      animationA.stop();
      animationB.stop();
    };
  }, [floatA, floatB]);

  // Control demo video playback
  useEffect(() => {
    if (!demoPlayer) return;
    const key = PAGES[index]?.key;
    if (key === 'demo') {
      demoPlayer.playAsync?.() ?? demoPlayer.play?.();
    } else {
      demoPlayer.pauseAsync?.() ?? demoPlayer.pause?.();
    }
  }, [index, demoPlayer]);

  const goNext = useCallback(async () => {
    const next = index + 1;
    if (next < PAGES.length) {
      setIndex(next);
      listRef.current?.scrollToIndex({ index: next, animated: true });
    } else {
      await completeOnboarding();
    }
  }, [index, completeOnboarding]);

  const handleMomentumScrollEnd = useCallback((e) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(newIndex);
  }, []);

  const renderPage = useCallback(({ item }) => {
    switch (item.key) {
      case 'problem':
        return <OnboardingProblemPage floatA={floatA} floatB={floatB} width={width} />;
      case 'solution':
        return <OnboardingSolutionPage floatA={floatA} floatB={floatB} width={width} />;
      case 'demo':
        return <OnboardingDemoPage player={demoPlayer} width={width} />;
      case 'motivation':
        return <OnboardingMotivationPage floatA={floatA} floatB={floatB} width={width} />;
      case 'pricing':
        return <OnboardingPricingPage width={width} />;
      default:
        return null;
    }
  }, [floatA, floatB, demoPlayer]);

  const keyExtractor = useCallback((item) => item.key, []);

  const isLastPage = index === PAGES.length - 1;
  const bottomPosition = insets.bottom + 24;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        ref={listRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={PAGES}
        keyExtractor={keyExtractor}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        renderItem={renderPage}
        removeClippedSubviews
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
      />

      <View style={[styles.dots, { bottom: insets.bottom + 96 }]}>
        {PAGES.map((p, i) => (
          <View 
            key={p.key} 
            style={[
              styles.dot, 
              { backgroundColor: i === index ? colors.primary : colors.border }
            ]} 
          />
        ))}
      </View>

      {isLastPage ? (
        <View style={[styles.ctaWrap, { bottom: bottomPosition }]}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.ctaButton, { backgroundColor: colors.primary }]}
            onPress={goNext}
          >
            <Text style={[styles.ctaText, { color: colors.background }]}>
              Start 30 day free trial
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <CircleButton
          onPress={goNext}
          icon="arrow-forward"
          backgroundColor={colors.primary}
          style={[styles.fab, { bottom: bottomPosition }]}
        />
      )}
    </SafeAreaView>
  );
}
