import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface ScreenHeaderProps {
  titulo: string;
  subtitulo?: string;
  onBack: () => void;
  textoVolver?: string;
  colorFondo?: string[];
  colorBoton?: string;
  colorTexto?: string;
  colorSubtitulo?: string;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  titulo,
  subtitulo,
  onBack,
  textoVolver = '← Volver',
  colorFondo = ['#0F0F23', '#1A1A2E', '#16213E'],
  colorBoton = '#C084FC',
  colorTexto = '#FFF',
  colorSubtitulo = 'rgba(255,255,255,0.45)',
}) => {
  const animHeader = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animHeader, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [animHeader]);

  return (
    <LinearGradient colors={colorFondo} style={styles.fondo}>
      <Animated.View style={[
        styles.header,
        {
          opacity: animHeader,
          transform: [{
            translateY: animHeader.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            }),
          }],
        },
      ]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={[styles.backTxt, { color: colorBoton }]}>{textoVolver}</Text>
        </TouchableOpacity>
        <Text style={[styles.titulo, { color: colorTexto }]}>{titulo}</Text>
        {subtitulo && (
          <Text style={[styles.sub, { color: colorSubtitulo }]}>{subtitulo}</Text>
        )}
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fondo: {},
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  backBtn: {
    marginBottom: 16,
    backgroundColor: 'rgba(147,51,234,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(147,51,234,0.3)',
  },
  backTxt: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  titulo: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  sub: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
  },
});

export default ScreenHeader;
