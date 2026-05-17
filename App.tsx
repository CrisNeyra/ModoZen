import React, { useState, useCallback } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context/AuthContext';
import { ProveedorIdioma } from './src/context/LanguageContext';
import { MusicPlayerProvider } from './src/context/MusicPlayerContext';
import { StatsProvider } from './src/context/StatsContext';
import { RatingPromptProvider } from './src/context/RatingPromptContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import DevSplashScreen from './src/screens/DevSplashScreen';

const ThemedStatusBar: React.FC = () => {
  const { themeMode } = useTheme();
  return (
    <StatusBar
      barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
      backgroundColor="transparent"
      translucent
    />
  );
};

const AppContent: React.FC = () => (
  <View style={{ flex: 1 }}>
    <ThemedStatusBar />
    <AppNavigator />
  </View>
);

const App = () => {
  const [splashDone, setSplashDone] = useState(false);
  const onSplashFinish = useCallback(() => setSplashDone(true), []);

  if (!splashDone) {
    return <DevSplashScreen onFinish={onSplashFinish} />;
  }

  return (
    <SafeAreaProvider>
      <ProveedorIdioma>
        <AuthProvider>
          <ThemeProvider>
            <StatsProvider>
              <MusicPlayerProvider>
                <RatingPromptProvider>
                  <AppContent />
                </RatingPromptProvider>
              </MusicPlayerProvider>
            </StatsProvider>
          </ThemeProvider>
        </AuthProvider>
      </ProveedorIdioma>
    </SafeAreaProvider>
  );
};

export default App;
