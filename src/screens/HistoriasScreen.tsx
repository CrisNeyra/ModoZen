// ============================================================
// HistoriasScreen.tsx — Historias para dormir
// Contenido narrativo relajante para conciliar el sueño.
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
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ListaPantallas } from '../navigation/AppNavigator'
import { useIdioma } from '../context/LanguageContext';
import { useMusicPlayer, PISTAS } from '../context/MusicPlayerContext';
import ScreenHeader from '../components/ScreenHeader';


type Nav = NativeStackNavigationProp<ListaPantallas, 'Historias'>;
interface Props { navigation: Nav; }

interface Historia {
  id: string;
  titulo_es: string;
  titulo_en: string;
  desc_es: string;
  desc_en: string;
  icono: string;
  dur: string;
  grad: string[];
  pistaIdx?: number;
}

const HISTORIAS: Historia[] = [
  {
    id: 'h1', titulo_es: 'El Faro en la Tormenta', titulo_en: 'The Lighthouse in the Storm',
    desc_es: 'Un viaje nocturno a una costa tranquila guiado por la luz de un faro antiguo.',
    desc_en: 'A night journey to a calm coast guided by the light of an ancient lighthouse.',
    icono: '🏠', dur: '15 min', grad: ['#1E3A5F', '#0F2B46'],
    pistaIdx: 0,
  },
  {
    id: 'h2', titulo_es: 'El Jardín de las Estrellas', titulo_en: 'The Garden of Stars',
    desc_es: 'Caminá por un jardín mágico donde cada flor brilla como una estrella.',
    desc_en: 'Walk through a magical garden where each flower shines like a star.',
    icono: '🌟', dur: '20 min', grad: ['#2D1B69', '#1A0F40'],
    pistaIdx: 4,
  },
  {
    id: 'h3', titulo_es: 'El Tren Nocturno', titulo_en: 'The Night Train',
    desc_es: 'Subite a un tren que viaja lentamente por paisajes de ensueño bajo la luna.',
    desc_en: 'Board a train that slowly travels through dreamlike landscapes under the moon.',
    icono: '🚂', dur: '18 min', grad: ['#1F2937', '#111827'],
    pistaIdx: 2,
  },
  {
    id: 'h4', titulo_es: 'Nubes de Algodón', titulo_en: 'Cotton Clouds',
    desc_es: 'Flotá entre nubes suaves mientras el mundo se calma y el silencio te envuelve.',
    desc_en: 'Float among soft clouds while the world calms down and silence embraces you.',
    icono: '☁️', dur: '12 min', grad: ['#374151', '#1F2937'],
    pistaIdx: 1,
  },
];

const HistoriasScreen: React.FC<Props> = ({ navigation }) => {
  const { idioma, t } = useIdioma();
  const { seleccionar, reproduciendo, pistaIdx, nombrePista } = useMusicPlayer();

  const animCards = useRef(HISTORIAS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(120,
      animCards.map(a => Animated.spring(a, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }))
    ).start();
  }, [animCards]);

  const escucharHistoria = (historia: Historia) => {
    if (historia.pistaIdx !== undefined && historia.pistaIdx < PISTAS.length) {
      seleccionar(historia.pistaIdx, { autoplay: true, resetProgress: true });
    } else {
      Alert.alert(
        idioma === 'es' ? 'Próximamente' : 'Coming Soon',
        idioma === 'es'
          ? 'El audio de esta historia estará disponible pronto.'
          : 'This story audio will be available soon.',
      );
    }
  };

  const estaReproduciendoHistoria = (historia: Historia): boolean => {
    if (historia.pistaIdx === undefined) return false;
    return pistaIdx === historia.pistaIdx && reproduciendo;
  };

  return (
    <View style={s.raiz}>
      <ScreenHeader
        titulo={t.historiasTitulo || 'Historias para Dormir'}
        subtitulo={t.historiasSub || 'Relatos relajantes para conciliar el sueño'}
        onBack={() => navigation.goBack()}
        textoVolver={`← ${t.volver}`}
      />

      <ScrollView contentContainerStyle={s.lista} showsVerticalScrollIndicator={false}>
          {HISTORIAS.map((h, i) => {
            const titulo = idioma === 'es' ? h.titulo_es : h.titulo_en;
            const desc = idioma === 'es' ? h.desc_es : h.desc_en;
            return (
              <Animated.View key={h.id} style={{
                opacity: animCards[i],
                transform: [{ translateY: animCards[i].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
              }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => escucharHistoria(h)}
                  style={s.cardTouchable}
                >
                  <LinearGradient colors={h.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
                    <View style={s.cardTop}>
                      <Text style={s.cardIcono}>{h.icono}</Text>
                      <View style={s.cardBadge}>
                        <Text style={s.cardBadgeTxt}>🌙 {h.dur}</Text>
                      </View>
                    </View>
                    <Text style={s.cardTitulo}>{titulo}</Text>
                    <Text style={s.cardDesc}>{desc}</Text>
                    <View style={s.cardPlayRow}>
                      <LinearGradient
                        colors={estaReproduciendoHistoria(h) ? ['#10B981', '#059669'] : ['#6366F1', '#4F46E5']}
                        style={s.playBtn}
                      >
                        <Text style={s.playTxt}>
                          {estaReproduciendoHistoria(h) ? '⏸' : '▶'} {t.escuchar || 'Escuchar'}
                        </Text>
                      </LinearGradient>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            );
          })}

          <View style={s.notaCard}>
            <Text style={s.notaEmoji}>📖</Text>
            <Text style={s.notaTxt}>{t.masHistorias || 'Próximamente más historias para dormir'}</Text>
          </View>
        </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  raiz: { flex: 1 },
  lista: { paddingHorizontal: 20, paddingBottom: 40 },
  cardTouchable: { marginBottom: 14 },
  card: {
    borderRadius: 22, padding: 22, marginTop: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardIcono: { fontSize: 36 },
  cardBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  cardBadgeTxt: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600', letterSpacing: 0.5 },
  cardTitulo: { fontSize: 20, fontWeight: '600', color: '#FFF', marginBottom: 6, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium' },
  cardDesc: { fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 20, marginBottom: 16, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light' },
  cardPlayRow: { alignItems: 'flex-start' },
  playBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 16 },
  playTxt: { color: '#FFF', fontSize: 14, fontWeight: '500', letterSpacing: 0.5 },
  notaCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 22, marginTop: 20,
    alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)', borderStyle: 'dashed',
  },
  notaEmoji: { fontSize: 28, marginBottom: 8 },
  notaTxt: { fontSize: 13, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', textAlign: 'center', fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light' },
});

export default HistoriasScreen;
