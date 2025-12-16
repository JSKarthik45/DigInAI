import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/main/HomeScreen';
import HistoryScreen from '../screens/main/HistoryScreen';
import { useThemeColors } from '../theme/ThemeContext';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const colors = useThemeColors();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.background, borderTopWidth: 0 },
        headerStyle: { backgroundColor: colors.background, height: 70 },
        tabBarIcon: ({ focused, size }) => {
          let iconName;
          if (route.name === 'Scanner') {
            iconName = focused ? 'barcode' : 'barcode-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else {
            iconName = 'help-circle';
          }
          return <Ionicons name={iconName} size={size} color={colors.primary} />;
        },
      })}
    >
      <Tab.Screen
        name="Scanner"
        component={HomeScreen}
        options={{
          headerTitleAlign: 'center',
          headerTitle: () => (
            <Text
              style={{
                fontSize: 20,
                fontWeight: '600',
                color: colors.text,
              }}
            >
              Scanner
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          headerTitleAlign: 'center',
          headerTitle: () => (
            <Text
              style={{
                fontSize: 20,
                fontWeight: '600',
                color: colors.text,
              }}
            >
              History
            </Text>
          ),
        }}
      />
      </Tab.Navigator>
  );
}
