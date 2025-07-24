import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import AuthScreen from '../screens/AuthScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={AuthScreen} options={{ title: 'Вход / Регистрация', headerShown: false }} />
      <Stack.Screen name="Register" component={AuthScreen} options={{ title: 'Вход / Регистрация', headerShown: false }} />
    </Stack.Navigator>
  );
} 