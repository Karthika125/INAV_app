// App.js
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import PayScreen from './src/screens/PayScreen';
import ConfirmationScreen from './src/screens/ConfirmationScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Stack = createStackNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: { backgroundColor: "#0b3d91" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "600" }
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: "iNav — Payments" }} />
            <Stack.Screen name="Pay" component={PayScreen} options={{ title: "Pay EMI" }} />
            <Stack.Screen name="Confirmation" component={ConfirmationScreen} options={{ title: "Payment Confirmation" }} />
            <Stack.Screen name="History" component={HistoryScreen} options={{ title: "Payment History" }} />
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </>
  );
}
