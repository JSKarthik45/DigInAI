import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import OnboardingNavigator from './src/navigation/OnboardingNavigator';
import { OnboardingContext } from './src/navigation/OnboardingContext';
import { navigationTheme, darkNavigationTheme } from './src/theme';
import { ThemeProvider } from './src/theme/ThemeContext';

// Set to true during development to always see onboarding
const SHOW_ONBOARDING_ALWAYS = false;
const ONBOARDING_KEY = 'hasOnboarded';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [devSessionOnboarding, setDevSessionOnboarding] = useState(SHOW_ONBOARDING_ALWAYS);
  
  const colorScheme = useColorScheme() || 'light';
  const navTheme = colorScheme === 'dark' ? darkNavigationTheme : navigationTheme;

  useEffect(() => {
    const init = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasOnboarded(value === 'true');
      } catch {
        setHasOnboarded(false);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } finally {
      setHasOnboarded(true);
      setDevSessionOnboarding(false);
    }
  }, []);

  const onboardingContextValue = useMemo(
    () => ({ completeOnboarding }),
    [completeOnboarding]
  );

  // Show nothing while loading - native splash handles this
  if (loading) return null;

  const showOnboarding = devSessionOnboarding || !hasOnboarded;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OnboardingContext.Provider value={onboardingContextValue}>
        <ThemeProvider>
          <StatusBar
            barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
            backgroundColor={navTheme.colors.background}
            translucent={false}
          />
          <NavigationContainer theme={navTheme}>
            {showOnboarding ? <OnboardingNavigator /> : <RootNavigator />}
          </NavigationContainer>
        </ThemeProvider>
      </OnboardingContext.Provider>
    </GestureHandlerRootView>
  );
}
