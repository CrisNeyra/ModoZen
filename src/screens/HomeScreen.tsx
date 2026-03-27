// ============================================================
// PantallaInicio.tsx — Pantalla principal de Modo Zen
// Mejorada con animaciones fluidas, gradientes, glassmorphism,
// íconos con glow, tarjetas con efecto de profundidad.
// ============================================================

import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Modal,
  TextInput,
} from 'react-native';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useIdioma } from '../context/LanguageContext';
import { useStats } from '../context/StatsContext';
import MusicPlayer from '../components/MusicPlayer';

const { width: ANCHO, height: ALTO } = Dimensions.get('window');
const videoFondo = require('../assets/background.mp4.mp4');

type ListaPantallas = {
  Home: { fromMeditation?: boolean } | undefined;
  MeditationSession: { sessionId: string };
  Sonidos: undefined;
  Progreso: undefined;
  Ajustes: undefined;
  Historias: undefined;
  VideosRelajantes: undefined;
  Caminatas: undefined;
  Biofeedback: undefined;
};
type Nav = NativeStackNavigationProp<ListaPantallas, 'Home'>;
type HomeRoute = RouteProp<ListaPantallas, 'Home'>;
interface Props { navigation: Nav; route: HomeRoute; }

const obtenerClavesSaludo = (): string => {
  const h = new Date().getHours();
  if (h >= 5 && h < 8) return 'saludo_madrugada';
  if (h >= 8 && h < 12) return 'saludo_manana';
  if (h >= 12 && h < 14) return 'saludo_mediodia';
  if (h >= 14 && h < 19) return 'saludo_tarde';
  if (h >= 19 && h < 23) return 'saludo_noche';
  return 'saludo_trasnoche';
};

const SESION_ESTILOS = [
  { gradiente: ['#3B82F6', '#1D4ED8'], icono: '💨', horario: ['manana', 'madrugada'] },
  { gradiente: ['#F59E0B', '#D97706'], icono: '☀️', horario: ['manana', 'mediodia'] },
  { gradiente: ['#8B5CF6', '#6D28D9'], icono: '🌙', horario: ['noche', 'trasnoche'] },
  { gradiente: ['#10B981', '#059669'], icono: '🍃', horario: ['tarde', 'mediodia'] },
  { gradiente: ['#EC4899', '#BE185D'], icono: '🧘', horario: ['tarde', 'manana'] },
  { gradiente: ['#F97316', '#EA580C'], icono: '🎯', horario: ['manana', 'mediodia', 'tarde'] },
];

const CLAVE_FEEDBACK = '@ModoZen:feedbackApp';

const HomeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { usuario, cerrarSesion } = useAuth();
  const { t } = useIdioma();
  const { diasSeguidos, minutosHoy, sesionesTotales } = useStats();
  const scrollRef = useRef<ScrollView>(null);

  // Animaciones de entrada escalonadas
  const animEntrada = useRef(new Animated.Value(0)).current;
  const animSaludo = useRef(new Animated.Value(0)).current;
  const animFrase = useRef(new Animated.Value(0)).current;
  const animSesiones = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(animEntrada, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(animSaludo, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(animFrase, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(animSesiones, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [animEntrada, animSaludo, animFrase, animSesiones]);

  // Modal de feedback
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [feedbackEstrellas, setFeedbackEstrellas] = useState(0);
  const [feedbackTexto, setFeedbackTexto] = useState('');

  useEffect(() => {
    if (route.params?.fromMeditation) {
      const timer = setTimeout(() => setMostrarFeedback(true), 800);
      navigation.setParams({ fromMeditation: undefined });
      return () => clearTimeout(timer);
    }
  }, [route.params?.fromMeditation, navigation]);

  const enviarFeedback = async () => {
    try {
      await AsyncStorage.setItem(CLAVE_FEEDBACK, JSON.stringify({
        estrellas: feedbackEstrellas, comentario: feedbackTexto, fecha: new Date().toISOString(),
      }));
    } catch {}
    setMostrarFeedback(false);
    setFeedbackEstrellas(0);
    setFeedbackTexto('');
  };

  const cerrarFeedback = () => {
    setMostrarFeedback(false);
    setFeedbackEstrellas(0);
    setFeedbackTexto('');
  };

  const fraseDelDia = useMemo(() => {
    const idx = new Date().getDate() % t.frases.length;
    return t.frases[idx];
  }, [t]);

  const claveSaludo = obtenerClavesSaludo();
  const saludo = (t as any)[claveSaludo] || t.saludo_manana;
  const nombreUsuario = usuario?.nombre || t.viajero;

  // Scroll indicator
  const [mostrarScroll, setMostrarScroll] = useState(true);
  const animScroll = useRef(new Animated.Value(1)).current;
  const scrollInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const animBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!mostrarScroll) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animBounce, { toValue: 10, duration: 600, useNativeDriver: true }),
        Animated.timing(animBounce, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [mostrarScroll, animBounce]);

  const enScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (e.nativeEvent.contentOffset.y > 120 && mostrarScroll) {
      setMostrarScroll(false);
      Animated.timing(animScroll, { toValue: 0, duration: 400, useNativeDriver: true }).start();
    }
  };

  const iniciarAutoScroll = useCallback(() => {
    scrollInterval.current = setInterval(() => {
      scrollRef.current?.scrollTo({ y: 99999, animated: true });
    }, 50);
  }, []);

  const detenerAutoScroll = useCallback(() => {
    if (scrollInterval.current) { clearInterval(scrollInterval.current); scrollInterval.current = null; }
  }, []);

  const sesionesTodas = useMemo(() => [
    { id: '1', titulo: t.sesion1_titulo, desc: t.sesion1_desc, dur: '5 min', ...SESION_ESTILOS[0] },
    { id: '2', titulo: t.sesion2_titulo, desc: t.sesion2_desc, dur: '10 min', ...SESION_ESTILOS[1] },
    { id: '3', titulo: t.sesion3_titulo, desc: t.sesion3_desc, dur: '15 min', ...SESION_ESTILOS[2] },
    { id: '4', titulo: t.sesion4_titulo, desc: t.sesion4_desc, dur: '10 min', ...SESION_ESTILOS[3] },
    { id: '5', titulo: t.sesion5_titulo, desc: t.sesion5_desc, dur: '12 min', ...SESION_ESTILOS[4] },
    { id: '6', titulo: t.sesion6_titulo, desc: t.sesion6_desc, dur: '8 min', ...SESION_ESTILOS[5] },
  ], [t]);

  // Sesiones ordenadas por hora del día: las sugeridas primero
  const franjaHoraria = useMemo(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 8) return 'madrugada';
    if (h >= 8 && h < 12) return 'manana';
    if (h >= 12 && h < 14) return 'mediodia';
    if (h >= 14 && h < 19) return 'tarde';
    if (h >= 19 && h < 23) return 'noche';
    return 'trasnoche';
  }, []);

  const sesiones = useMemo(() => {
    const sugeridas = sesionesTodas.filter(s => s.horario.includes(franjaHoraria));
    const resto = sesionesTodas.filter(s => !s.horario.includes(franjaHoraria));
    return [...sugeridas, ...resto];
  }, [sesionesTodas, franjaHoraria]);

  // Glow pulsante
  const animGlow = useRef(new Animated.Value(0.4)).current;
  const animSparkle1 = useRef(new Animated.Value(0)).current;
  const animSparkle2 = useRef(new Animated.Value(0)).current;
  const animSparkle3 = useRef(new Animated.Value(0)).current;
  const animFraseScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animGlow, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(animGlow, { toValue: 0.4, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
    // 5-second sparkle attention effect
    const sparkleSeq = (anim: Animated.Value, delay: number) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: true }),
          ]),
          { iterations: 6 }
        ),
      ]);
    Animated.parallel([
      sparkleSeq(animSparkle1, 0),
      sparkleSeq(animSparkle2, 200),
      sparkleSeq(animSparkle3, 400),
      Animated.sequence([
        Animated.timing(animFraseScale, { toValue: 1.03, duration: 1500, useNativeDriver: true }),
        Animated.timing(animFraseScale, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ]),
    ]).start();
  }, [animGlow, animSparkle1, animSparkle2, animSparkle3, animFraseScale]);

  // ─── Horizontal paging state ───
  const [paginaActual, setPaginaActual] = useState(0);
  const hScrollRef = useRef<ScrollView>(null);
  const animDot = useRef(new Animated.Value(0)).current;

  const onHScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / ANCHO);
    if (page !== paginaActual) setPaginaActual(page);
    animDot.setValue(e.nativeEvent.contentOffset.x / ANCHO);
  }, [paginaActual, animDot]);

  // Swipe hint — visible only until user visits page 2 at least once
  const [hizoSwipe, setHizoSwipe] = useState(false);
  const animSwipeHint = useRef(new Animated.Value(0)).current;
  const animSwipeArrow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (paginaActual >= 1 && !hizoSwipe) setHizoSwipe(true);
  }, [paginaActual, hizoSwipe]);

  useEffect(() => {
    if (hizoSwipe) {
      Animated.timing(animSwipeHint, { toValue: 0, duration: 400, useNativeDriver: true }).start();
      return;
    }
    const loopOpacity = Animated.loop(
      Animated.sequence([
        Animated.timing(animSwipeHint, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(animSwipeHint, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ]),
    );
    const loopArrow = Animated.loop(
      Animated.sequence([
        Animated.timing(animSwipeArrow, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(animSwipeArrow, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    );
    loopOpacity.start();
    loopArrow.start();
    return () => { loopOpacity.stop(); loopArrow.stop(); };
  }, [hizoSwipe, animSwipeHint, animSwipeArrow]);

  return (
    <View style={estilos.raiz}>
      <Video source={videoFondo} style={estilos.videoFondo} resizeMode="cover" repeat muted
        playInBackground={false} playWhenInactive={false} ignoreSilentSwitch="ignore" mixWithOthers="mix"
        rate={1.0} paused={false} maxBitRate={500000} disableFocus />
      <LinearGradient
        colors={['rgba(15,15,35,0.3)', 'rgba(26,26,46,0.45)', 'rgba(15,15,35,0.55)']}
        style={estilos.overlay}
      />

      {/* ─── Horizontal paging container ─── */}
      <ScrollView
        ref={hScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onHScroll}
        scrollEventThrottle={16}
        style={estilos.scroll}
      >
        {/* ═══════════ PÁGINA 1 — Principal ═══════════ */}
        <View style={{ width: ANCHO }}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={estilos.scrollContenido}
            showsVerticalScrollIndicator={false}
            onScroll={enScroll}
            scrollEventThrottle={16}
          >
        {/* ─── Barra superior ─── */}
        <Animated.View style={[estilos.barraTop, {
          opacity: animEntrada,
          transform: [{ translateY: animEntrada.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        }]}>
          <View style={estilos.bloqueUsuario}>
            <Text style={estilos.saludo}>{saludo}</Text>
            <Text style={estilos.nombre}>{nombreUsuario}</Text>
          </View>
          <TouchableOpacity onPress={cerrarSesion} style={estilos.botonSalir} activeOpacity={0.7}>
            <Text style={estilos.textoSalir}>{t.salir} 👋</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ─── Frase del día ─── */}
        <Animated.View style={{
          opacity: animSaludo,
          transform: [{ translateY: animSaludo.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        }}>
          <LinearGradient
            colors={['rgba(147,51,234,0.25)', 'rgba(99,102,241,0.15)', 'rgba(147,51,234,0.25)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={estilos.cardFrase}
          >
            <View style={estilos.cardFraseHeader}>
              <Animated.Text style={[estilos.cardFraseEmoji, { opacity: animGlow }]}>✨</Animated.Text>
              <Text style={estilos.cardFraseTitulo}>{t.tuMensajePositivo}</Text>
              <Animated.Text style={[estilos.cardFraseEmoji, { opacity: animGlow }]}>✨</Animated.Text>
            </View>
            <Animated.View style={{ transform: [{ scale: animFraseScale }] }}>
              <Text style={estilos.cardFraseTexto}>{`"${fraseDelDia}"`}</Text>
            </Animated.View>
            <View style={estilos.sparkleRow}>
              <Animated.Text style={[estilos.sparkle, { opacity: animSparkle1 }]}>✦</Animated.Text>
              <Animated.Text style={[estilos.sparkle, { opacity: animSparkle2 }]}>✧</Animated.Text>
              <Animated.Text style={[estilos.sparkle, { opacity: animSparkle3 }]}>✦</Animated.Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ─── Reproductor ─── */}
        <Animated.View style={{
          opacity: animFrase,
          transform: [{ translateY: animFrase.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        }}>
          <View style={estilos.seccionHeader}>
            <Text style={estilos.seccionEmoji}>🎵</Text>
            <Text style={estilos.seccionTitulo}>{t.musicaMeditar}</Text>
          </View>
          <MusicPlayer />
        </Animated.View>

        {/* ─── Sesiones ─── */}
        {/* ─── Sesiones sugeridas para vos ─── */}
        <Animated.View style={{
          opacity: animSesiones,
          transform: [{ translateY: animSesiones.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        }}>
          <View style={estilos.seccionHeader}>
            <Text style={estilos.seccionEmoji}>🧘</Text>
            <View>
              <Text style={estilos.seccionTitulo}>{t.sesionesDeMeditacion}</Text>
              <Text style={estilos.seccionSub}>{t.sugeridoParaTi || t.elegiTuMomento}</Text>
            </View>
          </View>

          <View style={estilos.gridSesiones}>
            {sesiones.map(s => (
              <TouchableOpacity key={s.id} activeOpacity={0.8}
                onPress={() => navigation.navigate('MeditationSession', { sessionId: s.id })}>
                <LinearGradient
                  colors={[...s.gradiente, 'rgba(0,0,0,0.2)']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={estilos.tarjetaSesion}
                >
                  <View style={estilos.iconoCircle}>
                    <Text style={estilos.iconoEmoji}>{s.icono}</Text>
                  </View>
                  <Text style={estilos.sesionTitulo}>{s.titulo}</Text>
                  <Text style={estilos.sesionDesc} numberOfLines={2}>{s.desc}</Text>
                  <View style={estilos.durBadge}>
                    <Text style={estilos.durText}>{s.dur}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* ─── Acciones rápidas ─── */}
        <View style={estilos.accionesRow}>
          {[
            { onPress: () => navigation.navigate('Sonidos'), icono: '🎶', texto: t.sonidos, grad: ['#06B6D4', '#0891B2'] as [string, string] },
            { onPress: () => navigation.navigate('Progreso'), icono: '📊', texto: t.progreso, grad: ['#8B5CF6', '#7C3AED'] as [string, string] },
            { onPress: () => navigation.navigate('Ajustes'), icono: '⚙️', texto: t.ajustes, grad: ['#6B7280', '#4B5563'] as [string, string] },
          ].map((a, i) => (
            <TouchableOpacity key={i} activeOpacity={0.8} onPress={a.onPress}>
              <LinearGradient colors={a.grad} style={estilos.accionBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={estilos.accionIcono}>{a.icono}</Text>
                <Text style={estilos.accionTxt}>{a.texto}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Swipe hint (bottom pill) ─── */}
        {paginaActual === 0 && !hizoSwipe && (
          <Animated.View style={[estilos.swipeHint, {
            opacity: animSwipeHint.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.85] }),
            transform: [{ translateX: animSwipeHint.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }],
          }]}>
            <Text style={estilos.swipeHintTxt}>{t.deslizaExplorar || 'Deslizá para explorar'} →</Text>
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─── Scroll indicator ─── */}
      {mostrarScroll && paginaActual === 0 && (
        <Animated.View style={[estilos.scrollIndicador, { opacity: animScroll, transform: [{ translateY: animBounce }] }]}
          pointerEvents="box-only">
          <TouchableOpacity activeOpacity={0.6} onPressIn={iniciarAutoScroll} onPressOut={detenerAutoScroll}
            style={estilos.scrollBoton}>
            <Text style={estilos.scrollArrow}>▼</Text>
            <Text style={estilos.scrollTxt}>{t.deslizaVerMas}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
        </View>

        {/* ═══════════ PÁGINA 2 — Explorar ═══════════ */}
        <View style={{ width: ANCHO }}>
          <ScrollView
            contentContainerStyle={estilos.scrollContenido}
            showsVerticalScrollIndicator={false}
          >
            {/* Título de la sección */}
            <View style={[estilos.barraTop, { marginTop: Platform.OS === 'ios' ? 0 : 0 }]}>
              <View style={estilos.bloqueUsuario}>
                <Text style={estilos.saludo}>✨ {t.explorar || 'Explorar'}</Text>
                <Text style={estilos.nombre}>{t.descubrirMas || 'Descubrí más contenido'}</Text>
              </View>
              <TouchableOpacity
                onPress={() => hScrollRef.current?.scrollTo({ x: 0, animated: true })}
                style={estilos.botonSalir} activeOpacity={0.7}>
                <Text style={estilos.textoSalir}>← {t.volver}</Text>
              </TouchableOpacity>
            </View>

            {/* ─── Contenido diversificado (cards grandes) ─── */}
            {[
              { onPress: () => navigation.navigate('VideosRelajantes'), icono: '🎬', titulo: t.videosRelajantes || 'Videos relajantes', desc: t.videosRelajantesSub || 'Videos de meditación y relajación', grad: ['#6366F1', '#4F46E5'] as [string, string] },
              { onPress: () => navigation.navigate('Caminatas'), icono: '🚶', titulo: t.caminatas || 'Caminatas', desc: t.caminatasSub || 'Meditación en movimiento', grad: ['#10B981', '#059669'] as [string, string] },
              { onPress: () => navigation.navigate('Biofeedback'), icono: '❤️', titulo: t.biofeedback || 'Biofeedback', desc: t.biofeedbackSub || 'Conectá tu dispositivo', grad: ['#EF4444', '#DC2626'] as [string, string] },
            ].map((item, i) => (
              <TouchableOpacity key={i} activeOpacity={0.85} onPress={item.onPress} style={{ marginBottom: 14 }}>
                <LinearGradient
                  colors={[...item.grad, 'rgba(0,0,0,0.15)']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={estilos.exploreCard}
                >
                  <Text style={estilos.exploreCardIcono}>{item.icono}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={estilos.exploreCardTitulo}>{item.titulo}</Text>
                    <Text style={estilos.exploreCardDesc}>{item.desc}</Text>
                  </View>
                  <Text style={estilos.exploreArrow}>→</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}

            {/* ─── Mini stats ─── */}
            <View style={[estilos.seccionHeader, { marginTop: 20 }]}>
              <Text style={estilos.seccionEmoji}>📊</Text>
              <Text style={estilos.seccionTitulo}>{t.progreso}</Text>
            </View>
            <View style={estilos.statsRow}>
              {[
                { num: `${diasSeguidos}`, label: t.diasSeguidos, icono: '🔥' },
                { num: `${minutosHoy}`, label: t.minutosHoy, icono: '⏱️' },
                { num: `${sesionesTotales}`, label: t.sesiones, icono: '🧘' },
              ].map((stat, i) => (
                <View key={i} style={estilos.statCard}>
                  <Text style={estilos.statIcono}>{stat.icono}</Text>
                  <Text style={estilos.statNum}>{stat.num}</Text>
                  <Text style={estilos.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* ─── Acceso rápido extra ─── */}
            <View style={estilos.accionesRow}>
              {[
                { onPress: () => navigation.navigate('Sonidos'), icono: '🎶', texto: t.sonidos, grad: ['#06B6D4', '#0891B2'] as [string, string] },
                { onPress: () => navigation.navigate('Progreso'), icono: '📊', texto: t.progreso, grad: ['#8B5CF6', '#7C3AED'] as [string, string] },
                { onPress: () => navigation.navigate('Ajustes'), icono: '⚙️', texto: t.ajustes, grad: ['#6B7280', '#4B5563'] as [string, string] },
              ].map((a, i) => (
                <TouchableOpacity key={i} activeOpacity={0.8} onPress={a.onPress}>
                  <LinearGradient colors={a.grad} style={estilos.accionBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={estilos.accionIcono}>{a.icono}</Text>
                    <Text style={estilos.accionTxt}>{a.texto}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </ScrollView>

      {/* ─── Floating right-edge swipe indicator ─── */}
      {!hizoSwipe && paginaActual === 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            estilos.floatingSwipe,
            {
              opacity: animSwipeHint.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.9] }),
              transform: [{
                translateX: animSwipeArrow.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }),
              }],
            },
          ]}
        >
          <Text style={estilos.floatingSwipeArrow}>›</Text>
        </Animated.View>
      )}

      {/* ─── Page dots ─── */}
      <View style={estilos.dotsRow}>
        {[0, 1].map(i => (
          <Animated.View key={i} style={[
            estilos.dot,
            {
              backgroundColor: animDot.interpolate({
                inputRange: [0, 1],
                outputRange: i === 0 ? ['#C084FC', 'rgba(255,255,255,0.25)'] : ['rgba(255,255,255,0.25)', '#C084FC'],
              }),
              transform: [{
                scale: animDot.interpolate({
                  inputRange: [0, 1],
                  outputRange: i === 0 ? [1.3, 0.8] : [0.8, 1.3],
                }),
              }],
            },
          ]} />
        ))}
      </View>

      {/* ─── Modal Feedback ─── */}
      <Modal visible={mostrarFeedback} transparent animationType="fade" onRequestClose={cerrarFeedback}>
        <View style={estilos.modalOverlay}>
          <View style={estilos.modalCard}>
            <LinearGradient
              colors={['rgba(147,51,234,0.3)', 'rgba(99,102,241,0.2)']}
              style={estilos.modalGradiente} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={estilos.modalEmoji}>💜</Text>
              <Text style={estilos.modalTitulo}>¿Te gusta la app?</Text>
              <Text style={estilos.modalSub}>Tu opinión nos ayuda a mejorar</Text>
              <View style={estilos.modalEstrellas}>
                {[1, 2, 3, 4, 5].map(e => (
                  <TouchableOpacity key={e} onPress={() => setFeedbackEstrellas(e)} style={estilos.modalStarBtn}>
                    <Text style={estilos.modalStar}>{e <= feedbackEstrellas ? '⭐' : '☆'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput style={estilos.modalInput} placeholder="Contanos qué podemos mejorar..."
                placeholderTextColor="rgba(255,255,255,0.4)" multiline maxLength={500}
                value={feedbackTexto} onChangeText={setFeedbackTexto} />
              <Text style={estilos.modalCharCount}>{feedbackTexto.length}/500</Text>
              <TouchableOpacity style={estilos.modalBtnEnviar} onPress={enviarFeedback} activeOpacity={0.8}>
                <LinearGradient colors={['#9333EA', '#7C3AED']} style={estilos.modalBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={estilos.modalBtnEnviarTxt}>Enviar ✨</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={estilos.modalBtnCerrar} onPress={cerrarFeedback}>
                <Text style={estilos.modalBtnCerrarTxt}>Ahora no</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: '#0F0F23' },
  videoFondo: { position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, width: ANCHO, height: ALTO },
  overlay: { position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 },
  scroll: { flex: 1 },
  scrollContenido: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  barraTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  bloqueUsuario: { flex: 1, paddingRight: 16 },
  saludo: {
    fontSize: 24, fontWeight: '600', color: '#C084FC',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
    textShadowColor: 'rgba(147,51,234,0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16,
    letterSpacing: 0.3,
  },
  nombre: {
    fontSize: 15, color: 'rgba(255,255,255,0.55)', marginTop: 4,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light', letterSpacing: 0.5,
  },
  botonSalir: {
    alignSelf: 'flex-start',
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)',
  },
  textoSalir: { color: 'rgba(255,255,255,0.78)', fontSize: 13, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir' },
  cardFrase: { borderRadius: 22, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(147,51,234,0.3)', alignItems: 'center' },
  cardFraseHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12, gap: 8 },
  cardFraseEmoji: { fontSize: 20, marginRight: 8 },
  cardFraseTitulo: {
    fontSize: 13, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1.5,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  cardFraseTexto: {
    fontSize: 21, color: '#FFF', fontStyle: 'italic', lineHeight: 32, textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light', letterSpacing: 0.3,
  },
  sparkleRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 16 },
  sparkle: { fontSize: 16, color: '#C084FC' },
  seccionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 8 },
  seccionEmoji: { fontSize: 22, marginRight: 10 },
  seccionTitulo: {
    fontSize: 20, fontWeight: '500', color: '#FFF', letterSpacing: 0.3,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  seccionSub: {
    fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20, gap: 10 },
  statCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 18, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  statIcono: { fontSize: 20, marginBottom: 6 },
  statNum: {
    fontSize: 26, fontWeight: '600', color: '#C084FC',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  statLabel: {
    fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 4, textTransform: 'uppercase',
    letterSpacing: 0.5, textAlign: 'center', fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir',
  },
  gridSesiones: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tarjetaSesion: {
    width: (ANCHO - 52) / 2, borderRadius: 20, padding: 18, marginBottom: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  iconoCircle: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  iconoEmoji: { fontSize: 24 },
  sesionTitulo: {
    fontSize: 14, fontWeight: '500', color: '#FFF', textAlign: 'center', marginBottom: 4,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium', letterSpacing: 0.2,
  },
  sesionDesc: {
    fontSize: 11, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 16, marginBottom: 10,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
  },
  durBadge: { backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  durText: {
    fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '600', letterSpacing: 0.5,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir',
  },
  accionesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 6, gap: 10 },
  accionBtn: {
    alignItems: 'center', borderRadius: 18, paddingHorizontal: 22, paddingVertical: 16,
    minWidth: (ANCHO - 60) / 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
  accionIcono: { fontSize: 24, marginBottom: 6 },
  accionTxt: {
    fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  scrollIndicador: { position: 'absolute', bottom: 24, alignSelf: 'center' },
  scrollBoton: {
    alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(147,51,234,0.3)',
  },
  scrollArrow: { fontSize: 14, color: '#C084FC', marginBottom: 2 },
  scrollTxt: {
    fontSize: 11, color: 'rgba(255,255,255,0.45)',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: {
    borderRadius: 28, width: '100%', maxWidth: 380, overflow: 'hidden',
    shadowColor: '#9333EA', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 30, elevation: 15,
  },
  modalGradiente: {
    padding: 28, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(147,51,234,0.4)',
    borderRadius: 28, backgroundColor: '#1E1E3A',
  },
  modalEmoji: { fontSize: 52, marginBottom: 14 },
  modalTitulo: {
    fontSize: 24, fontWeight: '600', color: '#FFF', marginBottom: 6, textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  modalSub: {
    fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 22, textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
  },
  modalEstrellas: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 22 },
  modalStarBtn: { padding: 4 },
  modalStar: { fontSize: 36 },
  modalInput: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 16,
    fontSize: 14, color: '#FFF', minHeight: 90, textAlignVertical: 'top',
    borderWidth: 1, borderColor: 'rgba(147,51,234,0.25)',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir',
  },
  modalCharCount: { alignSelf: 'flex-end', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4, marginBottom: 18 },
  modalBtnEnviar: { width: '100%', borderRadius: 18, overflow: 'hidden' },
  modalBtnGrad: { paddingVertical: 16, alignItems: 'center', borderRadius: 18 },
  modalBtnEnviarTxt: {
    color: '#FFF', fontSize: 16, fontWeight: '500', letterSpacing: 0.5,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  modalBtnCerrar: { marginTop: 14, padding: 8 },
  modalBtnCerrarTxt: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir' },
  // ─── Horizontal paging ───
  dotsRow: {
    position: 'absolute', bottom: 12, alignSelf: 'center', flexDirection: 'row', gap: 8,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
  },
  swipeHint: {
    alignSelf: 'center', marginTop: 10, paddingHorizontal: 18, paddingVertical: 8,
    backgroundColor: 'rgba(147,51,234,0.15)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(147,51,234,0.25)',
    flexDirection: 'row', alignItems: 'center',
  },
  swipeHintTxt: {
    fontSize: 13, color: '#C084FC', fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  floatingSwipe: {
    position: 'absolute', right: 0, top: '45%',
    backgroundColor: 'rgba(147,51,234,0.35)',
    paddingVertical: 20, paddingHorizontal: 6,
    borderTopLeftRadius: 14, borderBottomLeftRadius: 14,
  },
  floatingSwipeArrow: {
    fontSize: 22, color: '#E9D5FF', fontWeight: '700',
  },
  // ─── Explore page cards ───
  exploreCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  exploreCardIcono: { fontSize: 36, marginRight: 16 },
  exploreCardTitulo: {
    fontSize: 18, fontWeight: '600', color: '#FFF',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  exploreCardDesc: {
    fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 3,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
  },
  exploreArrow: { fontSize: 22, color: 'rgba(255,255,255,0.6)', marginLeft: 8 },
});

export default HomeScreen;
