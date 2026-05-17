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
} from 'react-native';
import Video, { ViewType } from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useIdioma } from '../context/LanguageContext';
import { useStats } from '../context/StatsContext';
import MusicPlayer from '../components/MusicPlayer';

const { width: ANCHO, height: ALTO } = Dimensions.get('window');
const videoFondo = require('../assets/background.mp4');

type ListaPantallas = {
  Home: { fromMeditation?: boolean } | undefined;
  MeditationSession: { sessionId: string };
  Sonidos: undefined;
  Progreso: undefined;
  Ajustes: undefined;
  Historias: undefined;
  VideosRelajantes: undefined;
  Reflexion: undefined;
  Caminatas: undefined;
  Biofeedback: undefined;
  Temporizador: undefined;
};
type Nav = NativeStackNavigationProp<ListaPantallas, 'Home'>;
interface Props { navigation: Nav; }

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

const CLAVE_ULTIMA_FRASE_POSITIVA_IDX = '@ModoZen:ultimaFrasePositivaIdx';

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { usuario, cerrarSesion } = useAuth();
  const { t } = useIdioma();
  const { diasSeguidos, minutosHoy, sesionesTotales, sesionesPorDia } = useStats();
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

  const [frasePositivaIdx, setFrasePositivaIdx] = useState(0);

  useEffect(() => {
    const elegirFrasePositiva = async () => {
      if (!t.frases.length) return;
      const fallback = Math.floor(Math.random() * t.frases.length);
      try {
        const rawLastIdx = await AsyncStorage.getItem(CLAVE_ULTIMA_FRASE_POSITIVA_IDX);
        const lastIdx = rawLastIdx !== null ? Number(rawLastIdx) : -1;
        let nextIdx = fallback;
        if (t.frases.length > 1) {
          const salto = 1 + Math.floor(Math.random() * (t.frases.length - 1));
          const safeLastIdx = Number.isFinite(lastIdx) && lastIdx >= 0 ? lastIdx : 0;
          nextIdx = (safeLastIdx + salto) % t.frases.length;
        }
        setFrasePositivaIdx(nextIdx);
        await AsyncStorage.setItem(CLAVE_ULTIMA_FRASE_POSITIVA_IDX, String(nextIdx));
      } catch {
        setFrasePositivaIdx(fallback);
      }
    };
    elegirFrasePositiva();
  }, [t.frases]);

  const fraseDelDia = t.frases[frasePositivaIdx] ?? t.frases[0] ?? '';

  const claveSaludo = obtenerClavesSaludo();
  const saludo = (t as any)[claveSaludo] || t.saludo_manana;
  const nombreUsuario = usuario?.nombre || t.viajero;

  // Scroll indicator
  const [mostrarScroll, setMostrarScroll] = useState(true);
  const animScroll = useRef(new Animated.Value(1)).current;
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

  const desplazarVertical = useCallback(() => {
    scrollRef.current?.scrollTo({ y: ALTO * 0.62, animated: true });
  }, []);

  const irAPaginaHorizontal = useCallback((pagina: 0 | 1) => {
    hScrollRef.current?.scrollTo({ x: ANCHO * pagina, animated: true });
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

  const minutosPorDiaSemana = useMemo(() => {
    const acumulado = Array(7).fill(0) as number[];
    for (const [fecha, minutos] of Object.entries(sesionesPorDia)) {
      const dia = new Date(`${fecha}T12:00:00`).getDay();
      const idxLunesPrimero = (dia + 6) % 7;
      acumulado[idxLunesPrimero] += minutos;
    }
    return acumulado;
  }, [sesionesPorDia]);

  const maxMinutosSemana = Math.max(...minutosPorDiaSemana, 1);

  const etiquetasSemana = useMemo(
    () => (t.volver === 'Back' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']),
    [t.volver],
  );

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
      <Video
        source={videoFondo}
        style={estilos.videoFondo}
        resizeMode="cover"
        repeat
        muted
        playInBackground={false}
        playWhenInactive={false}
        ignoreSilentSwitch="ignore"
        mixWithOthers="mix"
        rate={1.0}
        paused={false}
        maxBitRate={500000}
        disableFocus
        {...(Platform.OS === 'android' ? { viewType: ViewType.TEXTURE } : {})}
      />
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

        <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('Reflexion')} style={estilos.reflexionCardWrap}>
          <LinearGradient
            colors={['#A855F7', '#7E22CE', 'rgba(0,0,0,0.15)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={estilos.reflexionCard}
          >
            <Text style={estilos.reflexionIcon}>🫶</Text>
            <View style={{ flex: 1 }}>
              <Text style={estilos.reflexionTitulo}>Reflexión guiada</Text>
              <Text style={estilos.reflexionDesc}>Contale al Guía Zen cómo te sentís hoy</Text>
            </View>
            <Text style={estilos.reflexionSpark}>✧</Text>
          </LinearGradient>
        </TouchableOpacity>

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

        {/* ─── Swipe hint (bottom pill) ─── */}
        {paginaActual === 0 && !hizoSwipe && (
          <Animated.View style={[{
            opacity: animSwipeHint.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.85] }),
            transform: [{ translateX: animSwipeHint.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }],
          }]}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => irAPaginaHorizontal(1)} style={estilos.swipeHint}>
            <Text style={estilos.swipeHintTxt}>{t.deslizaExplorar || 'Deslizá para explorar'} →</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─── Scroll indicator ─── */}
      {mostrarScroll && paginaActual === 0 && (
        <Animated.View style={[estilos.scrollIndicador, { opacity: animScroll, transform: [{ translateY: animBounce }] }]}
          pointerEvents="box-only">
          <TouchableOpacity activeOpacity={0.6} onPress={desplazarVertical}
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
              { onPress: () => navigation.navigate('Temporizador'), icono: '⏱️', titulo: t.temporizador || 'Temporizador', desc: t.temporizadorSub || 'Contá minutos de relajación', grad: ['#9333EA', '#7C22CE'] as [string, string] },
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

            <View style={estilos.progresoCard}>
              <View style={[estilos.seccionHeader, { marginTop: 0, marginBottom: 10 }]}>
                <Text style={estilos.seccionEmoji}>📊</Text>
                <Text style={estilos.seccionTitulo}>{t.progreso} semanal</Text>
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

              <View style={estilos.heatmapGrid}>
                {minutosPorDiaSemana.map((minutos, idx) => {
                  const intensidad = minutos / maxMinutosSemana;
                  const color =
                    intensidad === 0
                      ? 'rgba(255,255,255,0.08)'
                      : intensidad < 0.35
                        ? '#4C1D95'
                        : intensidad < 0.65
                          ? '#7E22CE'
                          : '#C084FC';
                  return (
                    <View key={`${etiquetasSemana[idx]}-${idx}`} style={estilos.heatmapDia}>
                      <View style={[estilos.heatmapCelda, { backgroundColor: color }]} />
                      <Text style={estilos.heatmapLabel}>{etiquetasSemana[idx]}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={estilos.heatmapLegend}>
                <Text style={estilos.heatmapLegendTxt}>Menos</Text>
                <View style={[estilos.heatmapLegendDot, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
                <View style={[estilos.heatmapLegendDot, { backgroundColor: '#4C1D95' }]} />
                <View style={[estilos.heatmapLegendDot, { backgroundColor: '#7E22CE' }]} />
                <View style={[estilos.heatmapLegendDot, { backgroundColor: '#C084FC' }]} />
                <Text style={estilos.heatmapLegendTxt}>Más</Text>
              </View>
            </View>

            {/* ─── Acceso rápido extra ─── */}
            <View style={estilos.accionesRow}>
              {[
                { onPress: () => navigation.navigate('Sonidos'), icono: '🎶', texto: t.sonidos, grad: ['#06B6D4', '#0891B2'] as [string, string] },
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
          style={[
            estilos.floatingSwipe,
            {
              opacity: animSwipeHint.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
              transform: [{
                translateX: animSwipeArrow.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }),
              }],
            },
          ]}
        >
          <TouchableOpacity onPress={() => irAPaginaHorizontal(1)} activeOpacity={0.9}>
            <Text style={estilos.floatingSwipeArrow}>›</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ─── Page dots ─── */}
      <View style={estilos.dotsRow}>
        {[0, 1].map(i => (
          <TouchableOpacity key={i} onPress={() => irAPaginaHorizontal(i as 0 | 1)} activeOpacity={0.9}>
            <Animated.View style={[
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
          </TouchableOpacity>
        ))}
      </View>
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
  reflexionCardWrap: { marginTop: -6, marginBottom: 16 },
  reflexionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 6,
  },
  reflexionIcon: { fontSize: 28, marginRight: 12 },
  reflexionTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  reflexionDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
  },
  reflexionSpark: {
    fontSize: 26,
    color: '#F5D0FE',
    marginLeft: 8,
    textAlignVertical: 'center',
    includeFontPadding: false,
    textShadowColor: 'rgba(245,208,254,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
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
  progresoCard: {
    marginTop: 20,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  heatmapGrid: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  heatmapDia: { alignItems: 'center', flex: 1 },
  heatmapCelda: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 6,
  },
  heatmapLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir',
  },
  heatmapLegend: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  heatmapLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  heatmapLegendTxt: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir',
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
    minWidth: (ANCHO - 56) / 2,
    flex: 1,
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
    backgroundColor: 'rgba(147,51,234,0.75)',
    paddingVertical: 22, paddingHorizontal: 8,
    borderTopLeftRadius: 14, borderBottomLeftRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  floatingSwipeArrow: {
    fontSize: 26, color: '#FFFFFF', fontWeight: '800',
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
