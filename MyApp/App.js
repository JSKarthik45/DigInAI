import React, { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import OnboardingNavigator from './src/navigation/OnboardingNavigator';
import { OnboardingContext } from './src/navigation/OnboardingContext';
import { NavigationContainer } from '@react-navigation/native';
import { navigationTheme, darkNavigationTheme } from './src/theme';
import { ThemeProvider } from './src/theme/ThemeContext';

// Toggle to force showing onboarding in development
// Set to true during development to always see onboarding
const SHOW_ONBOARDING_ALWAYS = true;

const ONBOARDING_KEY = 'hasOnboarded';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  // In dev, start in onboarding even if stored as completed,
  // but allow switching to app after finishing within the session.
  const [devSessionOnboarding, setDevSessionOnboarding] = useState(SHOW_ONBOARDING_ALWAYS);
  const colorScheme = useColorScheme() || 'light';
  const navTheme = colorScheme === 'dark' ? darkNavigationTheme : navigationTheme;
  useEffect(() => {
    const init = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasOnboarded(value === 'true');
      } catch (e) {
        setHasOnboarded(false);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);
  if (loading) {
    // While loading preferences/onboarding flag, rely on the native Expo splash.
    return null;
  }

  // In development, start with onboarding but allow exit on completion
  const showOnboarding = devSessionOnboarding ? true : !hasOnboarded;

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } finally {
      setHasOnboarded(true);
      // End dev-only onboarding for this session so app shows after completion
      setDevSessionOnboarding(false);
    }
  };


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OnboardingContext.Provider value={{ completeOnboarding }}>
        <ThemeProvider>
          <NavigationContainer theme={navTheme}>
            {showOnboarding ? <OnboardingNavigator /> : <RootNavigator />}
          </NavigationContainer>
        </ThemeProvider>
      </OnboardingContext.Provider>
    </GestureHandlerRootView>
  );
}

// Onboarding completion is handled through OnboardingContext
