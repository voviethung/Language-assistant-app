import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '@/screens/home/HomeScreen';
import TranslateScreen from '@/screens/translate/TranslateScreen';
import HistoryScreen from '@/screens/history/HistoryScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';

export type MainTabParamList = {
  Home: undefined;
  Translate: undefined;
  History: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const icons: Record<string, {focused: string; unfocused: string}> = {
  Home: {focused: 'mic', unfocused: 'mic-outline'},
  Translate: {focused: 'language', unfocused: 'language-outline'},
  History: {focused: 'time', unfocused: 'time-outline'},
  Profile: {focused: 'person', unfocused: 'person-outline'},
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          const icon = icons[route.name];
          const name = focused ? icon.focused : icon.unfocused;
          return <Icon name={name} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          paddingBottom: 4,
          height: 60,
        },
        headerStyle: {backgroundColor: '#6366f1'},
        headerTintColor: '#ffffff',
        headerTitleStyle: {fontWeight: 'bold'},
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{title: 'Voice', headerTitle: 'Language Assistant'}}
      />
      <Tab.Screen
        name="Translate"
        component={TranslateScreen}
        options={{title: 'Translate', headerTitle: 'Text Translate'}}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{title: 'History', headerTitle: 'History'}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{title: 'Profile', headerTitle: 'My Profile'}}
      />
    </Tab.Navigator>
  );
}
