import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import HeatItUp from './src/App';
import { colors } from './src/theme';
import { LanguageProvider } from './src/i18n/context';
export default function App() {
  return <SafeAreaProvider style={{ backgroundColor: colors.background }}><StatusBar style="light" /><LanguageProvider><HeatItUp /></LanguageProvider></SafeAreaProvider>;
}
