import React, { useMemo, useCallback } from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/main/HomeScreen';
import HistoryScreen from '../screens/main/HistoryScreen';
import { useThemeColors } from '../theme/ThemeContext';

const Tab = createBottomTabNavigator();

const TAB_CONFIG = {
  Scanner: {
    icon: { focused: 'barcode', unfocused: 'barcode-outline' },
    component: HomeScreen,
  },
  History: {
    icon: { focused: 'time', unfocused: 'time-outline' },
    component: HistoryScreen,
  },
};

export default function AppNavigator() {
  const colors = useThemeColors();

  const screenOptions = useMemo(
    () => ({
      headerShown: true,
      tabBarActiveTintColor: colors.text,
      tabBarInactiveTintColor: colors.muted,
      tabBarStyle: { 
        backgroundColor: colors.background, 
        borderTopWidth: 0,
        paddingTop: 4,
      },
      headerStyle: { 
        backgroundColor: colors.background, 
        height: 70,
        shadowOpacity: 0,
        elevation: 0,
      },
      headerTitleAlign: 'center',
    }),
    [colors]
  );

  const getTabBarIcon = useCallback(
    (routeName, focused, size) => {
      const config = TAB_CONFIG[routeName];
      if (!config) return null;
      const iconName = focused ? config.icon.focused : config.icon.unfocused;
      return <Ionicons name={iconName} size={size} color={focused ? colors.text : colors.muted} />;
    },
    [colors]
  );

  const getHeaderTitle = useCallback(
    (title) => () => (
      <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
    ),
    [colors]
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...screenOptions,
        tabBarIcon: ({ focused, size }) => getTabBarIcon(route.name, focused, size),
      })}
    >
      <Tab.Screen
        name="Scanner"
        component={HomeScreen}
        options={{ headerTitle: getHeaderTitle('Scanner') }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ headerTitle: getHeaderTitle('History') }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
});
