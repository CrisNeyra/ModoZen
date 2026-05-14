// ============================================================
// CaminatasScreen.tsx — Meditation Walks
// Meditación en movimiento con guía y seguimiento.
// Al tocar ▶ se reproduce el sonido ambiente asociado via contexto.
// ============================================================

import React, { useRef, useEffect, useState } from 'react';
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
import { useIdioma } from '../context/LanguageContext';
import { useMusicPlayer } from '../context/MusicPlayerContext';


type Nav = NativeStackNavigationProp<any>;
interface Props { navigation: Nav; }

interface Caminata {
  id: string;
  titulo_es: string;
  titulo_en: string;
  desc_es: string;
  desc_en: string;
  instrucciones_es: string;
  instrucciones_en: string;
  icono: string;
  dur: string;
  durMin: number;
  intensidad: 'baja' | 'media' | 'alta';
  intensidadIcono: string;
  grad: string[];
  /** Índice de la pista de audio en PISTAS del MusicPlayerContext */
  pistaAudioIdx: number;
}

const CAMINATAS: Caminata[] = [
  {
    id: 'w1',
    titulo_es: 'Paseo Consciente',
    titulo_en: 'Mindful Walk',
    desc_es: 'Caminata suave enfocada en la respiración y la atención plena al entorno. Ideal para principiantes.',
    desc_en: 'Gentle walk focused on breathing and mindful awareness of your surroundings. Ideal for beginners.',
    instrucciones_es: '1. Caminá a paso lento\n2. Inhalá 4 tiempos, exhalá 6\n3. Observá cada detalle del entorno\n4. Si tu mente divaga, volvé a la respiración',
    instrucciones_en: '1. Walk at a slow pace\n2. Inhale 4 counts, exhale 6\n3. Observe every detail around you\n4. If your mind wanders, return to breathing',
    icono: '🚶',
    dur: '10 min',
    durMin: 10,
    intensidad: 'baja',
    intensidadIcono: '🟢',
    grad: ['#10B981', '#059669'],
    pistaAudioIdx: 2, // Bosque tranquilo
  },
  {
    id: 'w2',
    titulo_es: 'Energía Natural',
    titulo_en: 'Natural Energy',
    desc_es: 'Caminata energizante con ritmo moderado. Conectá con la naturaleza mientras activás tu cuerpo y mente.',
    desc_en: 'Energizing walk at a moderate pace. Connect with nature while activating your body and mind.',
    instrucciones_es: '1. Comenzá con paso firme\n2. Sentí cada pisada en el suelo\n3. Respirá profundo con cada paso\n4. Acelerá gradualmente el ritmo',
    instrucciones_en: '1. Start with a firm pace\n2. Feel each step on the ground\n3. Breathe deeply with each step\n4. Gradually increase the rhythm',
    icono: '🌿',
    dur: '15 min',
    durMin: 15,
    intensidad: 'media',
    intensidadIcono: '🟡',
    grad: ['#F59E0B', '#D97706'],
    pistaAudioIdx: 1, // Lluvia suave
  },
  {
    id: 'w3',
    titulo_es: 'Atardecer Meditativo',
    titulo_en: 'Meditative Sunset',
    desc_es: 'Caminata lenta al ritmo de la respiración profunda. Perfecta para cerrar el día después del trabajo.',
    desc_en: 'Slow walk at the rhythm of deep breaths. Perfect for winding down after work.',
    instrucciones_es: '1. Elegí un momento al atardecer\n2. Caminá muy lento, sin apuro\n3. Observá los colores del cielo\n4. Agradecé por el día vivido',
    instrucciones_en: '1. Choose a sunset moment\n2. Walk very slowly, no rush\n3. Observe the colors of the sky\n4. Be grateful for the day lived',
    icono: '🌅',
    dur: '20 min',
    durMin: 20,
    intensidad: 'baja',
    intensidadIcono: '🟢',
    grad: ['#F97316', '#EA580C'],
    pistaAudioIdx: 0, // Olas de mar Zen
  },
  {
    id: 'w4',
    titulo_es: 'Gratitud en Movimiento',
    titulo_en: 'Gratitude in Motion',
    desc_es: 'Mientras caminás, reflexioná sobre lo que agradecés en tu vida. Una práctica poderosa para elevar el ánimo.',
    desc_en: 'While walking, reflect on what you\'re grateful for. A powerful practice to lift your spirits.',
    instrucciones_es: '1. Con cada paso, pensá en algo positivo\n2. Nombrá mentalmente 3 cosas que agradecés\n3. Sonreí mientras caminás\n4. Cerrá con 3 respiraciones profundas',
    instrucciones_en: '1. With each step, think of something positive\n2. Mentally name 3 things you\'re grateful for\n3. Smile as you walk\n4. Close with 3 deep breaths',
    icono: '🙏',
    dur: '12 min',
    durMin: 12,
    intensidad: 'baja',
    intensidadIcono: '🟢',
    grad: ['#8B5CF6', '#6D28D9'],
    pistaAudioIdx: 3, // Fogata crepitante
  },
];

const CaminatasScreen: React.FC<Props> = ({ navigation }) => {
  const { idioma, t } = useIdioma();
  const { seleccionar, reproduciendo, pistaIdx, toggleReproduccion } = useMusicPlayer();
  const [caminataActiva, setCaminataActiva] = useState<string | null>(null);

  const iniciarCaminata = (cam: Caminata) => {
    const pistaActiva = pistaIdx === cam.pistaAudioIdx;
    if (pistaActiva) {
      toggleReproduccion();
    } else {
      seleccionar(cam.pistaAudioIdx, { autoplay: true, resetProgress: true });
    }
    setCaminataActiva(cam.id);
    const instrucciones = idioma === 'es' ? cam.instrucciones_es : cam.instrucciones_en;
    const tituloAlert = idioma === 'es' ? `🎧 ${cam.titulo_es}` : `🎧 ${cam.titulo_en}`;
    const boton = idioma === 'es' ? '¡Vamos!' : "Let's go!";
    Alert.alert(tituloAlert, instrucciones, [{ text: boton }]);
  };

  const animHeader = useRef(new Animated.Value(0)).current;
  const animCards = useRef(CAMINATAS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(animHeader, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.stagger(120,
      animCards.map(a => Animated.spring(a, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }))
    ).start();
  }, [animHeader, animCards]);

  return (
    <View style={s.raiz}>
      <LinearGradient colors={['#0F0F23', '#1A1A2E', '#16213E']} style={s.fondo}>
        <Animated.View style={[s.header, {
          opacity: animHeader,
          transform: [{ translateY: animHeader.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
            <Text style={s.backTxt}>← {t.volver}</Text>
          </TouchableOpacity>
          <Text style={s.titulo}>{t.caminatasTitulo || 'Meditation Walks'}</Text>
          <Text style={s.sub}>{t.caminatasSub || 'Meditación en movimiento'}</Text>
        </Animated.View>

        <ScrollView contentContainerStyle={s.lista} showsVerticalScrollIndicator={false}>
          {CAMINATAS.map((c, i) => {
            const titulo = idioma === 'es' ? c.titulo_es : c.titulo_en;
            const desc = idioma === 'es' ? c.desc_es : c.desc_en;
            const activa = caminataActiva === c.id && reproduciendo && pistaIdx === c.pistaAudioIdx;
            return (
              <Animated.View key={c.id} style={{
                opacity: animCards[i],
                transform: [{ translateX: animCards[i].interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }],
              }}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => iniciarCaminata(c)}>
                  <View style={[s.card, activa && s.cardActiva]}>
                    <LinearGradient colors={c.grad} style={s.cardIconWrap} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <Text style={s.cardIcono}>{c.icono}</Text>
                    </LinearGradient>
                    <View style={s.cardInfo}>
                      <Text style={s.cardTitulo}>{titulo}</Text>
                      <Text style={s.cardDesc} numberOfLines={2}>{desc}</Text>
                      <View style={s.cardMeta}>
                        <Text style={s.cardDur}>⏱️ {c.dur}</Text>
                        <Text style={s.cardIntensidad}>{c.intensidadIcono} {c.intensidad === 'baja' ? (idioma === 'es' ? 'Suave' : 'Easy') : c.intensidad === 'media' ? (idioma === 'es' ? 'Moderada' : 'Moderate') : (idioma === 'es' ? 'Intensa' : 'Intense')}</Text>
                      </View>
                    </View>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => iniciarCaminata(c)}>
                      <LinearGradient colors={activa ? ['#7C3AED', '#6D28D9'] : c.grad} style={s.playBadge}>
                        <Text style={s.playIcon}>{activa ? '⏸' : '▶'}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}

          {/* Consejo */}
          <View style={s.tipCard}>
            <Text style={s.tipEmoji}>💡</Text>
            <Text style={s.tipTxt}>
              {t.tipCaminata || 'Usá auriculares y elegí un lugar seguro para caminar. Mantené la atención al entorno mientras seguís las instrucciones de audio.'}
            </Text>
          </View>

          <View style={s.notaCard}>
            <Text style={s.notaEmoji}>🗺️</Text>
            <Text style={s.notaTxt}>{t.masCaminatas || 'Próximamente: más rutas y meditaciones en movimiento'}</Text>
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
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18, padding: 14, marginTop: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  cardActiva: {
    borderColor: 'rgba(147,51,234,0.4)',
    backgroundColor: 'rgba(147,51,234,0.1)',
  },
  cardIconWrap: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  cardIcono: { fontSize: 26 },
  cardInfo: { flex: 1, marginLeft: 14 },
  cardTitulo: { fontSize: 16, fontWeight: '600', color: '#FFF', fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium' },
  cardDesc: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2, lineHeight: 17, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 10 },
  cardDur: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  cardIntensidad: { fontSize: 11 },
  playBadge: {
    width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  playIcon: { fontSize: 14, color: '#FFF', marginLeft: 2 },
  tipCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.12)',
    borderRadius: 16, padding: 16, marginTop: 20, borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)',
  },
  tipEmoji: { fontSize: 22, marginRight: 12 },
  tipTxt: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 19, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light' },
  notaCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 22, marginTop: 16,
    alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)', borderStyle: 'dashed',
  },
  notaEmoji: { fontSize: 28, marginBottom: 8 },
  notaTxt: { fontSize: 13, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', textAlign: 'center', fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light' },
});

export default CaminatasScreen;
