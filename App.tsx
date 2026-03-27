import React, { useState, useCallback } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context/AuthContext';
import { ProveedorIdioma } from './src/context/LanguageContext';
import { MusicPlayerProvider } from './src/context/MusicPlayerContext';
import { StatsProvider } from './src/context/StatsContext';
import AppNavigator from './src/navigation/AppNavigator';
import DevSplashScreen from './src/screens/DevSplashScreen';

const App = () => {
  const [splashDone, setSplashDone] = useState(false);
  const onSplashFinish = useCallback(() => setSplashDone(true), []);

  if (!splashDone) {
    return <DevSplashScreen onFinish={onSplashFinish} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ProveedorIdioma>
        <AuthProvider>
          <StatsProvider>
            <MusicPlayerProvider>
              <AppNavigator />
            </MusicPlayerProvider>
          </StatsProvider>
        </AuthProvider>
      </ProveedorIdioma>
    </SafeAreaProvider>
  );
};

export default App;