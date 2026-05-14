// ============================================================
// PantallaSonidos.tsx — Vista de pistas de audio
// Mejorada con gradientes, animaciones y diseño moderno.
// ============================================================

import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIdioma } from '../context/LanguageContext';
import { useMusicPlayer } from '../context/MusicPlayerContext';


type Nav = NativeStackNavigationProp<any>;
interface Props { navigation: Nav; }

const PISTAS = [
  { id: '2', nombre_es: 'Olas de mar Zen', nombre_en: 'Zen Ocean Waves', icono: '🌊', dur: '∞', grad: ['#06B6D4', '#0891B2'] },
  { id: '1', nombre_es: 'Lluvia suave', nombre_en: 'Soft Rain', icono: '🌧️', dur: '∞', grad: ['#3B82F6', '#1D4ED8'] },
  { id: '3', nombre_es: 'Bosque tranquilo', nombre_en: 'Peaceful Forest', icono: '🌿', dur: '∞', grad: ['#10B981', '#059669'] },
  { id: '4', nombre_es: 'Fogata crepitante', nombre_en: 'Crackling Fire', icono: '🔥', dur: '∞', grad: ['#F97316', '#EA580C'] },
];

const SonidosScreen: React.FC<Props> = ({ navigation }) => {
  const { idioma, t } = useIdioma();
  const { pistaIdx, reproduciendo, seleccionar, toggleReproduccion } = useMusicPlayer();

  // Animaciones de entrada
  const animHeader = useRef(new Animated.Value(0)).current;
  const animCards = useRef(PISTAS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(animHeader, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.stagger(100,
      animCards.map(a => Animated.spring(a, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }))
    ).start();
  }, [animHeader, animCards]);

  const reproducirPista = (idx: number) => {
    if (pistaIdx === idx) {
      toggleReproduccion();
      return;
    }
    seleccionar(idx, { autoplay: true, resetProgress: true });
  };

  return (
    <View style={s.raiz}>
      <LinearGradient colors={['#0F0F23', '#1A1A2E', '#16213E']} style={s.fondo}>
        {/* Encabezado */}
        <Animated.View style={[s.header, {
          opacity: animHeader,
          transform: [{ translateY: animHeader.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
            <Text style={s.backTxt}>← {t.volver}</Text>
          </TouchableOpacity>
          <Text style={s.titulo}>{t.tituloSonidos}</Text>
          <Text style={s.sub}>{t.subtituloSonidos}</Text>
        </Animated.View>

        <ScrollView contentContainerStyle={s.lista} showsVerticalScrollIndicator={false}>
          <Text style={s.seccion}>{t.todasLasPistas}</Text>

          {PISTAS.map((p, i) => {
            const activa = pistaIdx === i;
            const estaReproduciendoPista = activa && reproduciendo;
            return (
            <Animated.View key={p.id} style={{
              opacity: animCards[i],
              transform: [{ translateX: animCards[i].interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }],
            }}>
              <View style={[s.pistaCard, activa && s.pistaCardActiva]}>
                <LinearGradient colors={p.grad} style={s.pistaIconoWrap} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={s.pistaIcono}>{p.icono}</Text>
                </LinearGradient>
                <View style={s.pistaInfo}>
                  <Text style={s.pistaNombre}>{idioma === 'es' ? p.nombre_es : p.nombre_en}</Text>
                  <Text style={s.pistaDur}>{p.dur}</Text>
                </View>
                <TouchableOpacity activeOpacity={0.7} onPress={() => reproducirPista(i)}>
                  <LinearGradient colors={['#9333EA', '#7C3AED']} style={s.playBadge}>
                    <Text style={s.playIcon}>{estaReproduciendoPista ? '⏸' : '▶'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          );
          })}

          {/* Nota */}
          <View style={s.notaCard}>
            <Text style={s.notaEmoji}>📁</Text>
            <Text style={s.notaTxt}>{t.agregarPistas}</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const s = StyleSheet.create({
  raiz: { flex: 1 },
  fondo: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 16 },
  backBtn: {
    marginBottom: 16, backgroundColor: 'rgba(147,51,234,0.15)', alignSelf: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(147,51,234,0.3)',
  },
  backTxt: {
    color: '#C084FC', fontSize: 15, fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  titulo: {
    fontSize: 28, fontWeight: '600', color: '#FFF', letterSpacing: 0.5,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  sub: {
    fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 4,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
  },
  lista: { paddingHorizontal: 20, paddingBottom: 40 },
  seccion: {
    fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.35)', marginTop: 16, marginBottom: 14,
    letterSpacing: 2, textTransform: 'uppercase',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  pistaCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  pistaCardActiva: {
    borderColor: 'rgba(147,51,234,0.35)',
    backgroundColor: 'rgba(147,51,234,0.1)',
  },
  pistaIconoWrap: {
    width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
  },
  pistaIcono: { fontSize: 22 },
  pistaInfo: { flex: 1, marginLeft: 14 },
  pistaNombre: {
    fontSize: 16, fontWeight: '600', color: '#FFF',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  pistaDur: {
    fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
  },
  playBadge: {
    width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#9333EA', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 4,
  },
  playIcon: { fontSize: 14, color: '#FFF', marginLeft: 2 },
  notaCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 22, marginTop: 20,
    alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)', borderStyle: 'dashed',
  },
  notaEmoji: { fontSize: 28, marginBottom: 8 },
  notaTxt: {
    fontSize: 13, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
  },
});

export default SonidosScreen;
