// ============================================================
// VideosRelajantesScreen.tsx — Galería premium de videos
// Arquitectura lista para streaming remoto (CDN).
// Categorías, reproductor con barra de progreso y controles.
// ============================================================

import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SectionList,
  StatusBar,
  Platform,
  Animated,
  ActivityIndicator,
  Image,
} from 'react-native';
import Video, { OnProgressData, OnLoadData } from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ListaPantallas } from '../navigation/AppNavigator';
import { useIdioma } from '../context/LanguageContext';
import { useMusicPlayer } from '../context/MusicPlayerContext';

type Nav = NativeStackNavigationProp<ListaPantallas, 'VideosRelajantes'>;
interface Props {
  navigation: Nav;
}

// ────────────────────────────────────────────────────────
// Modelo de datos — listo para migrar a API / Firestore
// ────────────────────────────────────────────────────────

interface VideoItem {
  id: string;
  titulo_es: string;
  titulo_en: string;
  descripcion_es: string;
  descripcion_en: string;
  icono?: string;
  duracion: string;
  /** URI remota (CDN) o require() local para desarrollo */
  fuente: any;
  /** URL de miniatura (CDN). Si no existe, se usa el primer frame del video. */
  thumbnailUrl?: string;
  gradiente: [string, string];
  categoria: string;
}

interface CategoriaVideos {
  id: string;
  titulo_es: string;
  titulo_en: string;
  icono: string;
}

// ── Categorías ──
const CATEGORIAS: CategoriaVideos[] = [
  { id: 'all',         titulo_es: 'Todos',             titulo_en: 'All',             icono: '✨' },
  { id: 'naturaleza',  titulo_es: 'Naturaleza',        titulo_en: 'Nature',          icono: '🌿' },
  { id: 'sanadores',   titulo_es: 'Sonidos Sanadores', titulo_en: 'Healing Sounds',  icono: '🎵' },
  { id: 'meditacion',  titulo_es: 'Meditación',        titulo_en: 'Meditation',      icono: '🧘' },
  { id: 'visual',      titulo_es: 'Arte Meditativo',   titulo_en: 'Meditative Art',  icono: '🎨' },
];

/**
 * CATÁLOGO DE VIDEOS — archivos locales reales.
 *
 * Para producción, reemplazá cada `fuente` por una URI de CDN:
 *   fuente: { uri: 'https://cdn.modozen.app/videos/tongue-drum.mp4' }
 */
const CATALOGO_VIDEOS: VideoItem[] = [
  // ── Naturaleza ──
  {
    id: 'nat-1',
    titulo_es: 'Bosque Tranquilo',
    titulo_en: 'Peaceful Forest',
    descripcion_es: 'Sumérgete en la calma de un bosque frondoso. Sonidos de aves y brisa entre los árboles para desconectar del ruido diario.',
    descripcion_en: 'Immerse yourself in the calm of a lush forest. Bird songs and breeze through the trees to disconnect from daily noise.',
    icono: '🌲',
    duracion: '10 min',
    fuente: require('../assets/videos/Bosque.mp4'),
    gradiente: ['#059669', '#047857'],
    categoria: 'naturaleza',
  },
  {
    id: 'nat-2',
    titulo_es: 'Mar Relajante',
    titulo_en: 'Relaxing Sea',
    descripcion_es: 'Olas suaves rompiendo en la orilla. El ritmo del mar calma la mente y acompaña momentos de paz interior.',
    descripcion_en: 'Gentle waves breaking on the shore. The rhythm of the sea calms the mind and accompanies moments of inner peace.',
    icono: '🌊',
    duracion: '10 min',
    fuente: require('../assets/videos/MarRelax.mp4'),
    gradiente: ['#0EA5E9', '#0284C7'],
    categoria: 'naturaleza',
  },
  {
    id: 'nat-3',
    titulo_es: 'Río Tranquilo',
    titulo_en: 'Calm River',
    descripcion_es: 'El fluir constante de un río en plena naturaleza. Agua cristalina y vegetación verde para una relajación profunda.',
    descripcion_en: 'The steady flow of a river in the heart of nature. Crystal clear water and green vegetation for deep relaxation.',
    icono: '🏞️',
    duracion: '10 min',
    fuente: require('../assets/videos/RioTranquiloNaturaleza.mp4'),
    gradiente: ['#10B981', '#059669'],
    categoria: 'naturaleza',
  },
  // ── Sonidos Sanadores ──
  {
    id: 'san-1',
    titulo_es: 'Cuencos de Cuarzo — Meditación',
    titulo_en: 'Crystal Bowls — Meditation',
    descripcion_es: 'Vibraciones armónicas de cuencos de cuarzo que equilibran los chakras. Ideal para meditar o relajarte antes de dormir.',
    descripcion_en: 'Harmonic crystal bowl vibrations that balance the chakras. Ideal for meditating or relaxing before sleep.',
    icono: '🔔',
    duracion: '10 min',
    fuente: require('../assets/videos/CuencosCuarzoMeditacion.mp4'),
    gradiente: ['#8B5CF6', '#7C3AED'],
    categoria: 'sanadores',
  },
  // ── Meditación ──
  {
    id: 'med-1',
    titulo_es: 'Respiración y Meditación',
    titulo_en: 'Breathing & Meditation',
    descripcion_es: 'Ejercicio guiado de respiración consciente y meditación. Perfecto para reducir la ansiedad y centrar la atención.',
    descripcion_en: 'Guided conscious breathing and meditation exercise. Perfect for reducing anxiety and centering your attention.',
    icono: '🧘',
    duracion: '10 min',
    fuente: require('../assets/videos/Respiracion y meditacion.mp4'),
    gradiente: ['#F59E0B', '#D97706'],
    categoria: 'meditacion',
  },
  // ── Arte Meditativo ──
  {
    id: 'vis-1',
    titulo_es: 'Pintura en lo profundo del bosque',
    titulo_en: 'Painting Deep in the Forest',
    descripcion_es: 'Técnica de pintura con depurador de hierro: observá cómo emerge un bosque sereno trazo a trazo. Arte visual hipnótico.',
    descripcion_en: 'Iron scourer painting technique: watch a serene forest emerge stroke by stroke. Hypnotic visual art.',
    icono: '🎨',
    duracion: '15 min',
    fuente: require('../assets/videos/Técnica de pintura con depurador de hierro-en lo profundo del bosque.mp4'),
    gradiente: ['#059669', '#047857'],
    categoria: 'visual',
  },
];

// ────────────────────────────────────────────────────────
// Thumbnail: seek a un frame real para evitar cuadro negro
// ────────────────────────────────────────────────────────
const VideoThumbnail = memo(({ source, style }: { source: any; style: any }) => {
  const ref = useRef<any>(null);
  return (
    <Video
      ref={ref}
      source={source}
      style={style}
      paused
      muted
      resizeMode="cover"
      onLoad={() => ref.current?.seek(2)}
    />
  );
});

// ────────────────────────────────────────────────────────
// Componente principal
// ────────────────────────────────────────────────────────

const VideosRelajantesScreen: React.FC<Props> = ({ navigation }) => {
  const { idioma, t } = useIdioma();
  const { reproduciendo: musicaReproduciendo, setReproduciendo: setMusicaReproduciendo } = useMusicPlayer();

  const [videoActivo, setVideoActivo] = useState<VideoItem | null>(null);
  const [pausado, setPausado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [progreso, setProgreso] = useState(0);
  const [duracion, setDuracion] = useState(0);
  const [categoriaActiva, setCategoriaActiva] = useState('all');
  const [mostrarControles, setMostrarControles] = useState(true);

  const reproductorRef = useRef<any>(null);
  const controlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animControles = useRef(new Animated.Value(1)).current;

  // Guardamos el estado previo de la música para restaurar al salir
  const musicaPreviaRef = useRef(false);

  const tituloVideo = useCallback(
    (v: VideoItem) => (idioma === 'es' ? v.titulo_es : v.titulo_en),
    [idioma],
  );
  const descVideo = useCallback(
    (v: VideoItem) => (idioma === 'es' ? v.descripcion_es : v.descripcion_en),
    [idioma],
  );
  const tituloCat = useCallback(
    (c: CategoriaVideos) => (idioma === 'es' ? c.titulo_es : c.titulo_en),
    [idioma],
  );

  // ── Filtrado por categoría ──
  const videosFiltrados = categoriaActiva === 'all'
    ? CATALOGO_VIDEOS
    : CATALOGO_VIDEOS.filter(v => v.categoria === categoriaActiva);

  // Agrupar por categoría para SectionList
  const secciones = categoriaActiva === 'all'
    ? CATEGORIAS.filter(c => c.id !== 'all')
        .map(c => ({
          title: `${c.icono} ${idioma === 'es' ? c.titulo_es : c.titulo_en}`,
          data: CATALOGO_VIDEOS.filter(v => v.categoria === c.id),
        }))
        .filter(s => s.data.length > 0)
    : [{ title: '', data: videosFiltrados }];

  // ── Reproducir video ──
  const abrirVideo = useCallback((item: VideoItem) => {
    musicaPreviaRef.current = musicaReproduciendo;
    if (musicaReproduciendo) setMusicaReproduciendo(false);
    setVideoActivo(item);
    setPausado(false);
    setCargando(true);
    setProgreso(0);
    setDuracion(0);
  }, [musicaReproduciendo, setMusicaReproduciendo]);

  const cerrarVideo = useCallback(() => {
    setVideoActivo(null);
    setPausado(false);
    setCargando(true);
    setProgreso(0);
    if (musicaPreviaRef.current) setMusicaReproduciendo(true);
  }, [setMusicaReproduciendo]);

  // ── Auto-hide controles tras 4 s ──
  const refrescarTimerControles = useCallback(() => {
    if (controlTimer.current) clearTimeout(controlTimer.current);
    setMostrarControles(true);
    Animated.timing(animControles, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    controlTimer.current = setTimeout(() => {
      Animated.timing(animControles, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        setMostrarControles(false);
      });
    }, 4000);
  }, [animControles]);

  useEffect(() => {
    if (videoActivo && !pausado) refrescarTimerControles();
    return () => { if (controlTimer.current) clearTimeout(controlTimer.current); };
  }, [videoActivo, pausado, refrescarTimerControles]);

  // Keep controls visible while paused
  useEffect(() => {
    if (pausado) {
      if (controlTimer.current) clearTimeout(controlTimer.current);
      setMostrarControles(true);
      Animated.timing(animControles, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  }, [pausado, animControles]);

  const onLoad = useCallback((data: OnLoadData) => {
    setDuracion(data.duration);
    setCargando(false);
  }, []);

  const onProgress = useCallback((data: OnProgressData) => {
    setProgreso(data.currentTime);
  }, []);

  const seekRelativo = useCallback((delta: number) => {
    const nuevo = Math.max(0, Math.min(duracion, progreso + delta));
    reproductorRef.current?.seek?.(nuevo);
    setProgreso(nuevo);
    refrescarTimerControles();
  }, [duracion, progreso, refrescarTimerControles]);

  const formatearTiempo = (seg: number): string => {
    const m = Math.floor(seg / 60);
    const s = Math.floor(seg % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ────────────────────────────────────────────────
  // REPRODUCTOR PREMIUM FULLSCREEN
  // ────────────────────────────────────────────────
  if (videoActivo) {
    const barraProgreso = duracion > 0 ? (progreso / duracion) * 100 : 0;
    return (
      <View style={s.playerContainer}>
        <StatusBar hidden />
        <Video
          ref={reproductorRef}
          source={videoActivo.fuente}
          style={s.playerVideo}
          resizeMode="contain"
          paused={pausado}
          repeat
          volume={1.0}
          ignoreSilentSwitch="ignore"
          mixWithOthers="duck"
          onLoad={onLoad}
          onProgress={onProgress}
          progressUpdateInterval={500}
          bufferConfig={{
            minBufferMs: 5000,
            maxBufferMs: 50000,
            bufferForPlaybackMs: 2500,
            bufferForPlaybackAfterRebufferMs: 5000,
          }}
        />

        {/* Tap zone → toggle controles */}
        <TouchableOpacity
          style={s.playerTapZone}
          activeOpacity={1}
          onPress={() => {
            if (mostrarControles) {
              Animated.timing(animControles, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setMostrarControles(false));
              if (controlTimer.current) clearTimeout(controlTimer.current);
            } else {
              refrescarTimerControles();
            }
          }}
        />

        {/* Loading spinner */}
        {cargando && (
          <View style={s.loadingOverlay}>
            <ActivityIndicator size="large" color="#C084FC" />
          </View>
        )}

        {/* Controles animados */}
        <Animated.View style={[s.controlsLayer, { opacity: animControles }]} pointerEvents={mostrarControles ? 'auto' : 'none'}>
          {/* Barra superior */}
          <LinearGradient colors={['rgba(0,0,0,0.7)', 'transparent']} style={s.playerTopBar}>
            <TouchableOpacity onPress={cerrarVideo} style={s.cerrarBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={s.cerrarTxt}>← {t.volver || 'Volver'}</Text>
            </TouchableOpacity>
            <Text style={s.playerTitle} numberOfLines={1}>{tituloVideo(videoActivo)}</Text>
          </LinearGradient>

          {/* Controles centrales */}
          <View style={s.centerControls}>
            <TouchableOpacity onPress={() => seekRelativo(-10)} style={s.seekBtn}>
              <Text style={s.seekTxt}>⟲ 10s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setPausado(p => !p); refrescarTimerControles(); }}
              style={s.playPauseBtn}
            >
              <Text style={s.playPauseTxt}>{pausado ? '▶' : '⏸'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => seekRelativo(10)} style={s.seekBtn}>
              <Text style={s.seekTxt}>10s ⟳</Text>
            </TouchableOpacity>
          </View>

          {/* Barra inferior: progreso */}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={s.playerBottomBar}>
            <View style={s.progressRow}>
              <Text style={s.timeTxt}>{formatearTiempo(progreso)}</Text>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${barraProgreso}%` }]} />
              </View>
              <Text style={s.timeTxt}>{formatearTiempo(duracion)}</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    );
  }

  // ────────────────────────────────────────────────
  // GALERÍA CON CATEGORÍAS
  // ────────────────────────────────────────────────
  return (
    <View style={s.container}>
      <LinearGradient colors={['#0F0F23', '#1A1A2E', '#16213E']} style={StyleSheet.absoluteFill} />

      {/* Encabezado */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backTxt}>← {t.volver || 'Volver'}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>🎬 {t.videosRelajantes || 'Videos relajantes'}</Text>
        <Text style={s.headerSub}>{t.videosRelajantesSub || 'Videos de meditación y relajación'}</Text>
      </View>

      {/* Filtro de categorías — scroll horizontal */}
      <View style={s.catRow}>
        {CATEGORIAS.map(c => {
          const activa = categoriaActiva === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => setCategoriaActiva(c.id)}
              style={[s.catPill, activa && s.catPillActiva]}
              activeOpacity={0.75}
            >
              <Text style={[s.catPillTxt, activa && s.catPillTxtActiva]}>
                {c.icono} {tituloCat(c)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Lista agrupada */}
      <SectionList
        sections={secciones}
        keyExtractor={item => item.id}
        contentContainerStyle={s.lista}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section: { title } }) =>
          title ? (
            <Text style={s.sectionHeader}>{title}</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => abrirVideo(item)}
            style={s.cardWrapper}
          >
            <View style={s.card}>
              {/* Thumbnail: CDN image o primer frame del video local */}
              <View style={s.thumbWrap}>
                {item.thumbnailUrl ? (
                  <Image source={{ uri: item.thumbnailUrl }} style={s.thumb} resizeMode="cover" />
                ) : (
                  <VideoThumbnail source={item.fuente} style={s.thumb} />
                )}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={s.thumbGradient}
                />
                <View style={s.thumbBadge}>
                  <Text style={s.thumbBadgeTxt}>{item.duracion}</Text>
                </View>
              </View>
              {/* Información */}
              <View style={s.cardBody}>
                <Text style={s.cardTitulo} numberOfLines={1}>{tituloVideo(item)}</Text>
                <Text style={s.cardDesc} numberOfLines={2}>{descVideo(item)}</Text>
              </View>
              <View style={s.cardPlayCircle}>
                <Text style={s.cardPlay}>▶</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={s.empty}>
            {idioma === 'es' ? 'No hay videos en esta categoría aún.' : 'No videos in this category yet.'}
          </Text>
        }
        ListFooterComponent={
          <Text style={s.footer}>
            {idioma === 'es'
              ? 'Próximamente: más videos de relajación'
              : 'Coming soon: more relaxation videos'}
          </Text>
        }
      />
    </View>
  );
};

// ────────────────────────────────────────────────────────
// ESTILOS
// ────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // ── Galería ──
  container: { flex: 1, backgroundColor: '#0F0F23' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backBtn: { marginBottom: 8 },
  backTxt: { color: '#C084FC', fontSize: 16, fontWeight: '600' },
  headerTitle: { color: '#FFF', fontSize: 26, fontWeight: '800', marginBottom: 4 },
  headerSub: { color: 'rgba(255,255,255,0.55)', fontSize: 14 },

  // ── Categorías ──
  catRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  catPillActiva: {
    backgroundColor: 'rgba(147,51,234,0.3)',
    borderColor: '#9333EA',
  },
  catPillTxt: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontWeight: '500',
  },
  catPillTxtActiva: {
    color: '#E9D5FF',
    fontWeight: '600',
  },

  // ── Lista ──
  lista: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 4 },
  sectionHeader: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  cardWrapper: { marginBottom: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  thumbWrap: {
    width: 120,
    height: 78,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginRight: 12,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 30,
  },
  thumbBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  thumbBadgeTxt: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  cardBody: { flex: 1, marginRight: 8 },
  cardTitulo: { color: '#FFF', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  cardDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 16 },
  cardPlayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(147,51,234,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(192,132,252,0.3)',
  },
  cardPlay: { fontSize: 16, color: '#FFF', marginLeft: 2 },
  empty: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.35)',
    fontSize: 14,
    marginTop: 40,
  },
  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    marginTop: 20,
    fontStyle: 'italic',
  },

  // ── Reproductor ──
  playerContainer: { flex: 1, backgroundColor: '#000' },
  playerVideo: { ...StyleSheet.absoluteFillObject },
  playerTapZone: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  controlsLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    zIndex: 3,
  },
  playerTopBar: {
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingHorizontal: 20,
    paddingBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cerrarBtn: { marginRight: 16 },
  cerrarTxt: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  playerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', flex: 1 },

  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  seekBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seekTxt: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  playPauseBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(147,51,234,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(192,132,252,0.5)',
  },
  playPauseTxt: { color: '#FFF', fontSize: 30 },

  playerBottomBar: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 30,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeTxt: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
    minWidth: 38,
    textAlign: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#C084FC',
  },
});

export default VideosRelajantesScreen;
