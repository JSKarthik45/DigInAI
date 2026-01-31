import React, { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './AppNavigator';
import AnalyseScreen from '../screens/main/AnalyseScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
    }),
    []
  );

  const analyseOptions = useMemo(
    () => ({
      presentation: 'fullScreenModal',
      animation: 'slide_from_bottom',
    }),
    []
  );

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MainTabs" component={AppNavigator} />
      <Stack.Screen
        name="Analyse"
        component={AnalyseScreen}
        options={analyseOptions}
      />
    </Stack.Navigator>
  );
}
