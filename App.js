import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppRegistry } from 'react-native';
import { ClosetProvider } from './src/context/ClosetContext';
import { ThemeProvider } from './src/context/ThemeContext';
import MainNavigator from './src/navigation/MainNavigator';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ClosetProvider>
          <NavigationContainer theme={navTheme}>
            <StatusBar style="dark" />
            <MainNavigator />
          </NavigationContainer>
        </ClosetProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

AppRegistry.registerComponent('main', () => App);
export default App;


