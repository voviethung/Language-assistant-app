import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuthStore} from '@/store/authStore';
import MainTabs from './MainTabs';
import LoginScreen from '@/screens/auth/LoginScreen';
import ConversationScreen from '@/screens/conversation/ConversationScreen';

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Conversation: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const {session} = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {session ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="Conversation"
            component={ConversationScreen}
            options={{
              headerShown: true,
              title: 'Live Conversation',
              presentation: 'modal',
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
