import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
  Dimensions,
  Vibration,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ListaPantallas } from '../navigation/AppNavigator';
import { useIdioma } from '../context/LanguageContext';
import { useStats } from '../context/StatsContext';
import ScreenHeader from '../components/ScreenHeader';

const { width } = Dimensions.get('window');
const CIRCULO_SIZE = width * 0.55;

type Nav = NativeStackNavigationProp<ListaPantallas, 'Respiracion'>;
interface Props { navigation: Nav; }

interface Patron {
  id: string;
  nombre_es: string;
  nombre_en: string;
  desc_es: string;
  desc_en: string;
  icono: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  gradiente: [string, string];
}

const PATRONES: Patron[] = [
  {
    id: '4-7-8',
    nombre_es: 'Relajación 4-7-8',
    nombre_en: 'Relaxation 4-7-8',
    desc_es: 'Inhala 4s, mantén 7s, exhala 8s. Ideal para dormir y reducir ansiedad.',
    desc_en: 'Inhale 4s, hold 7s, exhale 8s. Ideal for sleep and anxiety reduction.',
    icono: '😴',
    inhale: 4, holdIn: 7, exhale: 8, holdOut: 0,
    gradiente: ['#6366F1', '#4F46E5'],
  },
  {
    id: 'box',
    nombre_es: 'Respiración Cuadrada',
    nombre_en: 'Box Breathing',
    desc_es: '4s inhalar, 4s retener, 4s exhalar, 4s retener. Usado por Navy SEALs para calma bajo presión.',
    desc_en: '4s inhale, 4s hold, 4s exhale, 4s hold. Used by Navy SEALs for calm under pressure.',
    icono: '⬜',
    inhale: 4, holdIn: 4, exhale: 4, holdOut: 4,
    gradiente: ['#10B981', '#059669'],
  },
  {
    id: 'coherente',
    nombre_es: 'Coherencia Cardíaca',
    nombre_en: 'Heart Coherence',
    desc_es: 'Inhala 5s, exhala 5s. Ritmo constante para equilibrar el sistema nervioso.',
    desc_en: 'Inhale 5s, exhale 5s. Steady rhythm to balance the nervous system.',
    icono: '💚',
    inhale: 5, holdIn: 0, exhale: 5, holdOut: 0,
    gradiente: ['#06B6D4', '#0891B2'],
  },
  {
    id: 'wimhof',
    nombre_es: 'Wim Hof',
    nombre_en: 'Wim Hof',
    desc_es: '30 respiraciones profundas rápidas, luego retén. Aumenta energía y resistencia.',
    desc_en: '30 deep fast breaths, then hold. Increases energy and resilience.',
    icono: '❄️',
    inhale: 2, holdIn: 0, exhale: 2, holdOut: 0,
    gradiente: ['#3B82F6', '#1D4ED8'],
  },
];

type FaseRespiracion = 'inhale' | 'holdIn' | 'exhale' | 'holdOut' | 'idle';

const RespiracionScreen: React.FC<Props> = ({ navigation }) => {
  const { idioma, t } = useIdioma();
  const { registrarSesion } = useStats();
  const [patronSeleccionado, setPatronSeleccionado] = useState<Patron | null>(null);
  const [fase, setFase] = useState<FaseRespiracion>('idle');
  const [contador, setContador] = useState(0);
  const [ciclosCompletados, setCiclosCompletados] = useState(0);
  const [segundosTranscurridos, setSegundosTranscurridos] = useState(0);

  const animEscala = useRef(new Animated.Value(1)).current;
  const animOpacidad = useRef(new Animated.Value(0.3)).current;
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tiempoInicioRef = useRef<Date | null>(null);

  useEffect(() => {
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, []);

  const obtenerTextoFase = useCallback((f: FaseRespiracion, p: Patron): string => {
    switch (f) {
      case 'inhale': return idioma === 'es' ? 'Inhala' : 'Inhale';
      case 'holdIn': return idioma === 'es' ? 'Retén' : 'Hold';
      case 'exhale': return idioma === 'es' ? 'Exhala' : 'Exhale';
      case 'holdOut': return idioma === 'es' ? 'Retén' : 'Hold';
      default: return '';
    }
  }, [idioma]);

  const obtenerDuracionFase = useCallback((f: FaseRespiracion, p: Patron): number => {
    switch (f) {
      case 'inhale': return p.inhale;
      case 'holdIn': return p.holdIn;
      case 'exhale': return p.exhale;
      case 'holdOut': return p.holdOut;
      default: return 0;
    }
  }, []);

  const siguienteFase = useCallback((patron: Patron, faseActual: FaseRespiracion): FaseRespiracion => {
    if (faseActual === 'inhale') {
      if (patron.holdIn > 0) return 'holdIn';
      return 'exhale';
    }
    if (faseActual === 'holdIn') return 'exhale';
    if (faseActual === 'exhale') {
      if (patron.holdOut > 0) return 'holdOut';
      return 'inhale';
    }
    if (faseActual === 'holdOut') return 'inhale';
    return 'inhale';
  }, []);

  const iniciarEjercicio = useCallback((patron: Patron) => {
    setPatronSeleccionado(patron);
    setFase('inhale');
    setContador(patron.inhale);
    setCiclosCompletados(0);
    setSegundosTranscurridos(0);
    tiempoInicioRef.current = new Date();

    animEscala.setValue(0.6);
    Animated.parallel([
      Animated.timing(animEscala, { toValue: 1, duration: patron.inhale * 1000, useNativeDriver: true }),
      Animated.timing(animOpacidad, { toValue: 0.8, duration: patron.inhale * 1000, useNativeDriver: true }),
    ]).start();

    if (intervaloRef.current) clearInterval(intervaloRef.current);
    intervaloRef.current = setInterval(() => {
      setContador(prev => {
        if (prev <= 1) {
          setFase(faseAnterior => {
            const siguiente = siguienteFase(patron, faseAnterior);
            const duracion = obtenerDuracionFase(siguiente, patron);

            if (faseAnterior === 'exhale' || (faseAnterior === 'holdOut' && siguiente === 'inhale')) {
              setCiclosCompletados(c => c + 1);
            }

            if (siguiente === 'inhale') {
              Animated.parallel([
                Animated.timing(animEscala, { toValue: 1, duration: patron.inhale * 1000, useNativeDriver: true }),
                Animated.timing(animOpacidad, { toValue: 0.8, duration: patron.inhale * 1000, useNativeDriver: true }),
              ]).start();
            } else if (siguiente === 'exhale') {
              Animated.parallel([
                Animated.timing(animEscala, { toValue: 0.6, duration: patron.exhale * 1000, useNativeDriver: true }),
                Animated.timing(animOpacidad, { toValue: 0.3, duration: patron.exhale * 1000, useNativeDriver: true }),
              ]).start();
            }

            return siguiente;
          });
          return obtenerDuracionFase(siguienteFase(patron, fase), patron);
        }
        return prev - 1;
      });
      setSegundosTranscurridos(s => s + 1);
    }, 1000);
  }, [animEscala, animOpacidad, obtenerDuracionFase, siguienteFase, fase]);

  const detenerEjercicio = useCallback(async () => {
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    setFase('idle');

    if (tiempoInicioRef.current && segundosTranscurridos > 30) {
      await registrarSesion({
        sessionId: `respiracion-${Date.now()}`,
        durationSeconds: segundosTranscurridos,
        note: `Ejercicio: ${patronSeleccionado?.id}`,
      });
    }

    setPatronSeleccionado(null);
    setCiclosCompletados(0);
    setSegundosTranscurridos(0);
  }, [segundosTranscurridos, patronSeleccionado, registrarSesion]);

  if (patronSeleccionado && fase !== 'idle') {
    return (
      <View style={s.raiz}>
        <LinearGradient colors={['#0F0F23', '#1A1A2E', '#16213E']} style={s.fondo}>
          <View style={s.ejercicioContainer}>
            <Text style={s.ejercicioTitulo}>
              {idioma === 'es' ? patronSeleccionado.nombre_es : patronSeleccionado.nombre_en}
            </Text>

            <View style={s.circuloWrap}>
              <Animated.View style={[s.circulo, {
                transform: [{ scale: animEscala }],
                backgroundColor: `${patronSeleccionado.gradiente[0]}44`,
                borderColor: patronSeleccionado.gradiente[0],
              }]}>
                <Animated.View style={[s.circuloInterno, {
                  opacity: animOpacidad,
                  backgroundColor: `${patronSeleccionado.gradiente[0]}66`,
                }]} />
              </Animated.View>
              <View style={s.circuloTexto}>
                <Text style={s.faseTexto}>{obtenerTextoFase(fase, patronSeleccionado)}</Text>
                <Text style={s.contadorTexto}>{contador}</Text>
              </View>
            </View>

            <Text style={s.ciclosTexto}>
              {idioma === 'es' ? 'Ciclos' : 'Cycles'}: {ciclosCompletados}
            </Text>

            <TouchableOpacity style={s.detenerBtn} onPress={detenerEjercicio} activeOpacity={0.8}>
              <Text style={s.detenerTxt}>{idioma === 'es' ? 'Detener' : 'Stop'}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={s.raiz}>
      <ScreenHeader
        titulo={t.respiracionTitulo || 'Ejercicios de Respiración'}
        subtitulo={t.respiracionSub || 'Elige un patrón de respiración'}
        onBack={() => navigation.goBack()}
        textoVolver={`← ${t.volver}`}
      />

      <ScrollView contentContainerStyle={s.lista} showsVerticalScrollIndicator={false}>
        {PATRONES.map(p => (
          <TouchableOpacity key={p.id} onPress={() => iniciarEjercicio(p)} activeOpacity={0.85} style={s.cardWrap}>
            <LinearGradient colors={p.gradiente} style={s.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={s.cardTop}>
                <Text style={s.cardIcono}>{p.icono}</Text>
                <Text style={s.cardNombre}>
                  {idioma === 'es' ? p.nombre_es : p.nombre_en}
                </Text>
              </View>
              <Text style={s.cardDesc}>
                {idioma === 'es' ? p.desc_es : p.desc_en}
              </Text>
              <View style={s.cardPatrón}>
                <Text style={s.cardPatrónTxt}>
                  {p.inhale}s · {p.holdIn > 0 ? `${p.holdIn}s · ` : ''}{p.exhale}s · {p.holdOut > 0 ? `${p.holdOut}s` : ''}
                </Text>
              </View>
              <View style={s.comenzarWrap}>
                <Text style={s.comenzarTxt}>▶ {idioma === 'es' ? 'Comenzar' : 'Start'}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        <View style={s.notaCard}>
          <Text style={s.notaEmoji}>💡</Text>
          <Text style={s.notaTxt}>
            {idioma === 'es'
              ? 'Practica al menos 5 minutos diarios para notar los beneficios.'
              : 'Practice at least 5 minutes daily to notice the benefits.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  raiz: { flex: 1 },
  fondo: { flex: 1 },
  lista: { paddingHorizontal: 20, paddingBottom: 40 },
  cardWrap: { marginBottom: 14, borderRadius: 22, overflow: 'hidden' },
  card: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardIcono: { fontSize: 32, marginRight: 12 },
  cardNombre: { fontSize: 20, fontWeight: '700', color: '#FFF', fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium' },
  cardDesc: { fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20, marginBottom: 12, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light' },
  cardPatrón: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  cardPatrónTxt: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontVariant: ['tabular-nums'] },
  comenzarWrap: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  comenzarTxt: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  notaCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 22,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
    borderStyle: 'dashed',
  },
  notaEmoji: { fontSize: 28, marginBottom: 8 },
  notaTxt: { fontSize: 13, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', textAlign: 'center', fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light' },

  ejercicioContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  ejercicioTitulo: { fontSize: 22, fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: 40, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium' },
  circuloWrap: { width: CIRCULO_SIZE, height: CIRCULO_SIZE, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  circulo: {
    width: '100%',
    height: '100%',
    borderRadius: CIRCULO_SIZE / 2,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circuloInterno: {
    width: '70%',
    height: '70%',
    borderRadius: (CIRCULO_SIZE * 0.7) / 2,
  },
  circuloTexto: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  faseTexto: { fontSize: 24, fontWeight: '600', color: '#FFF', marginBottom: 4, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium' },
  contadorTexto: { fontSize: 48, fontWeight: '300', color: '#FFF', fontVariant: ['tabular-nums'] },
  ciclosTexto: { fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 30 },
  detenerBtn: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  detenerTxt: { color: '#EF4444', fontSize: 16, fontWeight: '600' },
});

export default RespiracionScreen;
