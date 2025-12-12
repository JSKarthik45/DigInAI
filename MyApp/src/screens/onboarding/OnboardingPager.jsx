import React, { useRef, useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CircleButton from '../../components/CircleButton';
import { OnboardingContext } from '../../navigation/OnboardingContext';
import { useThemeColors, useThemedStyles } from '../../theme/ThemeContext';

const { width } = Dimensions.get('window');

const PAGES = [
  { key: 'problem' },
  { key: 'solution' },
  { key: 'demo' },
  { key: 'motivation' },
  { key: 'pricing' },
];

const styleFactory = (colors) => StyleSheet.create({
  container: { flex: 1 },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 90,
  },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center' },
  subtitle: { marginTop: 10, textAlign: 'center' },
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
    bottom: 24,
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
    color: '#fff',
  },
});

export default function OnboardingPager() {
  const colors = useThemeColors();
  const styles = useThemedStyles(styleFactory);
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);
  const { completeOnboarding } = useContext(OnboardingContext);
  const [blocked, setBlocked] = useState({});
  const [problemTarget, setProblemTarget] = useState(5);

  const demoPlayer = useVideoPlayer(
    'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    (player) => {
      player.loop = true;
    }
  );

  const goNext = async () => {
    const next = index + 1;
    if (next < PAGES.length) {
      setIndex(next);
      listRef.current?.scrollToIndex({ index: next, animated: true });
    } else {
      await completeOnboarding();
    }
  };

  // Floating animations reused across pages
  const floatA = useRef(new Animated.Value(0)).current;
  const floatB = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatA, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(floatA, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatB, { toValue: 1, duration: 2600, useNativeDriver: true }),
        Animated.timing(floatB, { toValue: 0, duration: 2600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Play demo video only when its page is visible; pause otherwise
  useEffect(() => {
    if (!demoPlayer) return;
    const key = PAGES[index]?.key;
    if (key === 'demo') {
      demoPlayer.playAsync?.() ?? demoPlayer.play?.();
    } else {
      demoPlayer.pauseAsync?.() ?? demoPlayer.pause?.();
    }
  }, [index, demoPlayer]);
  const floatUpDownA = floatA.interpolate({ inputRange: [0,1], outputRange: [6, -6] });
  const floatUpDownB = floatB.interpolate({ inputRange: [0,1], outputRange: [-5, 5] });

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]} edges={['top','left','right']}> 
      <FlatList
        ref={listRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={PAGES}
        keyExtractor={(item) => item.key}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(newIndex);
        }}
        renderItem={({ item }) => {
          if (item.key === 'problem') {
            return (
              <View style={[styles.page, { width, backgroundColor: colors.background }]}> 
                  <Text style={[styles.title, { color: colors.secondary }]}>Trusting labels blindly?</Text>
                  <Text style={[styles.subtitle, { color: colors.muted }]}>It’s impossible to memorize every preservative. Hidden nasties often slip into your cart unnoticed.</Text>
                  <View style={{ position: 'absolute', top: 80, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
                    {/* Scatter chemical / additive icons around screen (hardcoded positions) */}
                    <Animated.View style={{ position: 'absolute', left: 16, top: 40, transform: [{ translateY: floatUpDownA }] }}>
                      <FontAwesome5 name="flask" size={36} color="#f97316" />
                    </Animated.View>
                    <Animated.View style={{ position: 'absolute', right: 24, top: 120, transform: [{ translateY: floatUpDownB }] }}>
                      <FontAwesome5 name="vial" size={36} color="#22c55e" />
                    </Animated.View>
                    <Animated.View style={{ position: 'absolute', left: width/2 - 18, top: 20, transform: [{ translateY: floatUpDownB }] }}>
                      <FontAwesome5 name="radiation-alt" size={36} color="#eab308" />
                    </Animated.View>
                    <Animated.View style={{ position: 'absolute', left: width/4, top: 200, transform: [{ translateY: floatUpDownA }] }}>
                      <FontAwesome5 name="skull-crossbones" size={36} color="#ef4444" />
                    </Animated.View>
                    <Animated.View style={{ position: 'absolute', left:102, bottom: 200, transform: [{ translateY: floatUpDownB }] }}>
                      <FontAwesome5 name="biohazard" size={36} color="#a855f7" />
                    </Animated.View>
                    <Animated.View style={{ position: 'absolute', right: 36, bottom: 220, transform: [{ translateY: floatUpDownA }] }}>
                      <FontAwesome5 name="prescription-bottle-alt" size={36} color="#0ea5e9" />
                    </Animated.View>
                    <Animated.View style={{ position: 'absolute', left: width - 100, top: 260, transform: [{ translateY: floatUpDownB }] }}>
                      <FontAwesome5 name="capsules" size={36} color="#f97316" />
                    </Animated.View>
                    <Animated.View style={{ position: 'absolute', left: 60, top: 300, transform: [{ translateY: floatUpDownA }] }}>
                      <FontAwesome5 name="atom" size={36} color="#38bdf8" />
                    </Animated.View>
                  </View>
              </View>
            );
          }
          if (item.key === 'solution') {
            return (
              <View style={[styles.page, { width, backgroundColor: colors.background }]}> 
                <Text style={[styles.title, { color: colors.secondary }]}>Turn scans into safety checks</Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>Scan the back, not the front. Get instant insights on synthetic colours and risky additives you should leave on the shelf.</Text>
                <View style={{ marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
                  <Animated.View style={{ transform: [{ translateY: floatUpDownA }] }}>
                    <Ionicons name="shield" size={36} color={colors.primary} />
                  </Animated.View>
                  <Animated.View style={{ transform: [{ translateY: floatUpDownB }] }}>
                    <Ionicons name="barcode" size={36} color={colors.secondary} />
                  </Animated.View>
                  <Animated.View style={{ transform: [{ translateY: floatUpDownA }] }}>
                    <Ionicons name="analytics" size={34} color={colors.text} />
                  </Animated.View>
                  <Animated.View style={{ transform: [{ translateY: floatUpDownB }] }}>
                    <Ionicons name="search" size={34} color={colors.muted} />
                  </Animated.View>
                </View>
              </View>
            );
          }
          if (item.key === 'demo') {
            return (
              <View style={[styles.page, { width, backgroundColor: colors.background }]}> 
                <View style={{ marginTop: 0, width: '100%', borderRadius: 16, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.surface }}>
                  <VideoView
                    style={{ width: '100%', height: 450 }}
                    player={demoPlayer}
                    fullscreenOptions={{}}
                    contentFit="cover"
                  />
                </View>
              </View>
            );
          }
          if (item.key === 'motivation') {
            return (
              <View style={[styles.page, { width, backgroundColor: colors.background }]}> 
                <Text style={[styles.title, { color: colors.secondary }]}>Master your grocery list</Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>Small choices away from processed chemicals, toward cleaner ingredients, lead to stronger health and better habits.</Text>
                  {/* Single row of progress/habits/brain icons */}
                  <View style={{ marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
                    <Animated.View style={{ transform: [{ translateY: floatUpDownA }] }}>
                      <Ionicons name="leaf" size={36} color={colors.primary} />
                    </Animated.View>
                    <Animated.View style={{ transform: [{ translateY: floatUpDownB }] }}>
                      <Ionicons name="nutrition" size={36} color={colors.secondary} />
                    </Animated.View>
                    <Animated.View style={{ transform: [{ translateY: floatUpDownA }] }}>
                      <Ionicons name="heart" size={36} color={colors.text} />
                    </Animated.View>
                    <Animated.View style={{ transform: [{ translateY: floatUpDownB }] }}>
                      <Ionicons name="happy" size={34} color={colors.muted} />
                    </Animated.View>
                  </View>
              </View>
            );
          }
          if (item.key === 'pricing') {
            return (
              <View style={[styles.page, { width, backgroundColor: colors.background }]}> 
                <Text style={[styles.title, { color: colors.secondary }]}>Pricing</Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>Choose the plan that fits your grocery routine  both include a 30 day free trial.</Text>
                <View style={{ marginTop: 24, width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, marginRight: 8, borderRadius: 16, padding: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.surface }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Monthly</Text>
                    <Text style={{ marginTop: 6, fontSize: 20, fontWeight: '800', color: colors.text }}>$4.99</Text>
                    <Text style={{ marginTop: 4, color: colors.muted }}>Flexible month-to-month billing.</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 8, borderRadius: 16, padding: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.primary, backgroundColor: colors.background }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Yearly</Text>
                    <Text style={{ marginTop: 6, fontSize: 20, fontWeight: '800', color: colors.text }}>$39.99</Text>
                    <Text style={{ marginTop: 4, color: colors.muted }}>Best value across the year.</Text>
                  </View>
                </View>
                <Text style={{ marginTop: 16, color: colors.muted, textAlign: 'center' }}>30 day free trial on all plans  enjoy full access before you pay.</Text>
              </View>
            );
          }
          return null;
        }}
      />

      <View style={[styles.dots, { bottom: insets.bottom + 96 }]}>
        {PAGES.map((p, i) => (
          <View key={p.key} style={[styles.dot, { backgroundColor: i === index ? colors.primary : colors.border }]} />
        ))}
      </View>

      {index === PAGES.length - 1 ? (
        <View style={[styles.ctaWrap, { bottom: insets.bottom + 24 }] }>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.ctaButton, { backgroundColor: colors.primary }]}
            onPress={goNext}
          >
            <Text style={styles.ctaText}>Start 30 day free trial</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <CircleButton
          onPress={goNext}
          icon="arrow-forward"
          backgroundColor={colors.primary}
          style={[styles.fab, { bottom: insets.bottom + 24 }]}
        />
      )}
    </SafeAreaView>
  );
}
