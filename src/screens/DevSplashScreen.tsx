// ============================================================
// DevSplashScreen.tsx — Pantalla de presentación del desarrollador
// Negro puro desde el arranque → Fade-in imagen → 3s → Fade-out → onFinish
// ============================================================

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, StatusBar } from 'react-native';

interface Props {
  onFinish: () => void;
}

const DevSplashScreen: React.FC<Props> = ({ onFinish }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, [opacity, onFinish]);

  return (
    <View style={s.container}>
      <StatusBar hidden />
      <Animated.Image
        source={require('../assets/crowdev.png')}
        style={[s.logo, { opacity }]}
        resizeMode="cover"
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  logo: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});

export default DevSplashScreen;
