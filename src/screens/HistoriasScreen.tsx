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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIdioma } from '../context/LanguageContext';


type Nav = NativeStackNavigationProp<any>;
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
}

const HISTORIAS: Historia[] = [
  {
    id: 'h1', titulo_es: 'El Faro en la Tormenta', titulo_en: 'The Lighthouse in the Storm',
    desc_es: 'Un viaje nocturno a una costa tranquila guiado por la luz de un faro antiguo.',
    desc_en: 'A night journey to a calm coast guided by the light of an ancient lighthouse.',
    icono: '🏠', dur: '15 min', grad: ['#1E3A5F', '#0F2B46'],
  },
  {
    id: 'h2', titulo_es: 'El Jardín de las Estrellas', titulo_en: 'The Garden of Stars',
    desc_es: 'Caminá por un jardín mágico donde cada flor brilla como una estrella.',
    desc_en: 'Walk through a magical garden where each flower shines like a star.',
    icono: '🌟', dur: '20 min', grad: ['#2D1B69', '#1A0F40'],
  },
  {
    id: 'h3', titulo_es: 'El Tren Nocturno', titulo_en: 'The Night Train',
    desc_es: 'Subite a un tren que viaja lentamente por paisajes de ensueño bajo la luna.',
    desc_en: 'Board a train that slowly travels through dreamlike landscapes under the moon.',
    icono: '🚂', dur: '18 min', grad: ['#1F2937', '#111827'],
  },
  {
    id: 'h4', titulo_es: 'Nubes de Algodón', titulo_en: 'Cotton Clouds',
    desc_es: 'Flotá entre nubes suaves mientras el mundo se calma y el silencio te envuelve.',
    desc_en: 'Float among soft clouds while the world calms down and silence embraces you.',
    icono: '☁️', dur: '12 min', grad: ['#374151', '#1F2937'],
  },
];

const HistoriasScreen: React.FC<Props> = ({ navigation }) => {
  const { idioma, t } = useIdioma();

  const animHeader = useRef(new Animated.Value(0)).current;
  const animCards = useRef(HISTORIAS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(animHeader, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.stagger(120,
      animCards.map(a => Animated.spring(a, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }))
    ).start();
  }, [animHeader, animCards]);

  return (
    <View style={s.raiz}>
      <LinearGradient colors={['#0F0F23', '#1A1A2E', '#0D1117']} style={s.fondo}>
        <Animated.View style={[s.header, {
          opacity: animHeader,
          transform: [{ translateY: animHeader.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
            <Text style={s.backTxt}>← {t.volver}</Text>
          </TouchableOpacity>
          <Text style={s.titulo}>{t.historiasTitulo || 'Historias para Dormir'}</Text>
          <Text style={s.sub}>{t.historiasSub || 'Relatos relajantes para conciliar el sueño'}</Text>
        </Animated.View>

        <ScrollView contentContainerStyle={s.lista} showsVerticalScrollIndicator={false}>
          {HISTORIAS.map((h, i) => {
            const titulo = idioma === 'es' ? h.titulo_es : h.titulo_en;
            const desc = idioma === 'es' ? h.desc_es : h.desc_en;
            return (
              <Animated.View key={h.id} style={{
                opacity: animCards[i],
                transform: [{ translateY: animCards[i].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
              }}>
                <TouchableOpacity activeOpacity={0.8}>
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
                      <LinearGradient colors={['#6366F1', '#4F46E5']} style={s.playBtn}>
                        <Text style={s.playTxt}>▶ {t.escuchar || 'Escuchar'}</Text>
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
  backTxt: { color: '#C084FC', fontSize: 15, fontWeight: '600', fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium' },
  titulo: { fontSize: 28, fontWeight: '600', color: '#FFF', letterSpacing: 0.5, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium' },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 4, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light' },
  lista: { paddingHorizontal: 20, paddingBottom: 40 },
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
