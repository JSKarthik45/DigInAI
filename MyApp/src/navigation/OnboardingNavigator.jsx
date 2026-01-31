import React, { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingPager from '../screens/onboarding/OnboardingPager';

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      animation: 'fade',
    }),
    []
  );

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Onboarding" component={OnboardingPager} />
    </Stack.Navigator>
  );
}
