// ============================================================
// VideosRelajantesScreen.tsx — Galería premium de videos
// Arquitectura lista para streaming remoto (CDN).
// Categorías, reproductor con barra de progreso y controles.
// ============================================================

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SectionList,
  StatusBar,
  Platform,
  ActivityIndicator,
  Image,
  useWindowDimensions,
} from 'react-native';
import Video, { OnLoadData, ViewType } from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ListaPantallas } from '../navigation/AppNavigator';
import { useIdioma } from '../context/LanguageContext';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { useRatingPrompt } from '../context/RatingPromptContext';

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
  /** Si true, `fuente` es imagen (jpg/png): miniatura y pantalla completa sin video. */
  soloImagen?: boolean;
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
];

// ────────────────────────────────────────────────────────
// Componente principal
// ────────────────────────────────────────────────────────

const VideosRelajantesScreen: React.FC<Props> = ({ navigation }) => {
  const { idioma, t } = useIdioma();
  const { reproduciendo: musicaReproduciendo, setReproduciendo: setMusicaReproduciendo } = useMusicPlayer();
  const { trackInteraction } = useRatingPrompt();
  const isFocused = useIsFocused();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [videoActivo, setVideoActivo] = useState<VideoItem | null>(null);
  const [cargando, setCargando] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState('all');
  const [esPantallaCompleta, setEsPantallaCompleta] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [androidViewType, setAndroidViewType] = useState<ViewType>(ViewType.TEXTURE);
  const [reintentoRender, setReintentoRender] = useState(0);

  const reproductorRef = React.useRef<any>(null);

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
    setEsPantallaCompleta(false);
    setCargando(!item.soloImagen);
    setBuffering(false);
    setMensajeError(null);
    setAndroidViewType(ViewType.TEXTURE);
    setReintentoRender(0);
    void trackInteraction('video_viewed');
  }, [musicaReproduciendo, setMusicaReproduciendo, trackInteraction]);

  const cerrarVideo = useCallback(() => {
    Orientation.lockToPortrait();
    setVideoActivo(null);
    setEsPantallaCompleta(false);
    setCargando(true);
    setBuffering(false);
    setMensajeError(null);
    if (musicaPreviaRef.current) setMusicaReproduciendo(true);
  }, [setMusicaReproduciendo]);

  const onLoad = useCallback((_data: OnLoadData) => {
    setCargando(false);
    setBuffering(false);
    setMensajeError(null);
  }, []);

  const onLoadStart = useCallback(() => {
    setCargando(true);
    setBuffering(false);
    setMensajeError(null);
  }, []);

  const onBuffer = useCallback((data: { isBuffering: boolean }) => {
    setBuffering(!!data?.isBuffering);
  }, []);

  const onError = useCallback(() => {
    setCargando(false);
    setBuffering(false);

    // Fallback Android: alternar entre TEXTURE y SURFACE una vez.
    if (
      Platform.OS === 'android'
      && reintentoRender === 0
    ) {
      setAndroidViewType(prev =>
        prev === ViewType.TEXTURE ? ViewType.SURFACE : ViewType.TEXTURE,
      );
      setReintentoRender(1);
      setCargando(true);
      return;
    }

    setMensajeError(
      idioma === 'es'
        ? 'No se pudo reproducir este video. Intenta con otro o vuelve a abrirlo.'
        : 'This video could not be played. Try another one or reopen it.',
    );
  }, [idioma, reintentoRender]);

  const entrarPantallaCompleta = useCallback(() => {
    setEsPantallaCompleta(true);
  }, []);

  const salirPantallaCompleta = useCallback(() => {
    setEsPantallaCompleta(false);
  }, []);

  useEffect(() => {
    if (esPantallaCompleta) {
      Orientation.lockToLandscape();
      return;
    }
    Orientation.lockToPortrait();
  }, [esPantallaCompleta]);

  useEffect(() => {
    return () => {
      Orientation.lockToPortrait();
    };
  }, []);

  // ────────────────────────────────────────────────
  // REPRODUCTOR PREMIUM FULLSCREEN
  // ────────────────────────────────────────────────
  if (videoActivo) {
    const esSoloImagen = !!videoActivo.soloImagen;
    const enFullscreen = esPantallaCompleta;
    const padPortraitHeader = insets.top + (Platform.OS === 'ios' ? 8 : 6);
    const safeWidth = screenWidth - insets.left - insets.right;
    const safeHeight = screenHeight - insets.top - insets.bottom;
    const anchoMarcoRetrato = Math.min(safeWidth - 20, 560);
    const altoTopBar = padPortraitHeader + 20;
    const altoDisponible = safeHeight - altoTopBar;
    const altoMarcoRetrato = Math.min(altoDisponible * 0.75, anchoMarcoRetrato * (9 / 16));

    return (
      <View style={s.playerContainer}>
        <StatusBar hidden={enFullscreen} translucent={enFullscreen} backgroundColor="#000" barStyle="light-content" />
        <View style={[s.playerTopBarPortrait, { paddingTop: padPortraitHeader }]}>
          <TouchableOpacity onPress={cerrarVideo} style={s.cerrarBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={s.cerrarTxt}>← {t.volver || 'Volver'}</Text>
          </TouchableOpacity>
          <Text style={s.playerTitle} numberOfLines={1}>{tituloVideo(videoActivo)}</Text>
          {!esSoloImagen && (
            <TouchableOpacity
              onPress={esPantallaCompleta ? salirPantallaCompleta : entrarPantallaCompleta}
              style={s.fullscreenSideBtn}
              activeOpacity={0.85}
            >
              <Text style={s.fullscreenSideBtnText}>{esPantallaCompleta ? '🗗' : '⛶'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[s.playerBody, !enFullscreen && s.playerBodyPortrait, enFullscreen && s.playerBodyLandscape]}>
          <View
            style={[
              s.videoFrame,
              enFullscreen
                ? s.videoFrameLandscape
                : [s.videoFramePortrait, { width: anchoMarcoRetrato, height: altoMarcoRetrato }],
            ]}
          >
            <View style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: enFullscreen ? 0 : 16 }}>
              {esSoloImagen ? (
                <Image source={videoActivo.fuente} style={s.playerVideo} resizeMode="contain" />
              ) : (
                <Video
                  key={`${videoActivo.id}-${androidViewType}-${reintentoRender}`}
                  ref={reproductorRef}
                  source={videoActivo.fuente}
                  style={s.playerVideo}
                  resizeMode="contain"
                controls
                paused={!isFocused}
                ignoreSilentSwitch="ignore"
                mixWithOthers="duck"
                playInBackground={false}
                playWhenInactive={false}
                preventsDisplaySleepDuringVideoPlayback
                shutterColor="transparent"
                onLoadStart={onLoadStart}
                onLoad={onLoad}
                onReadyForDisplay={() => setCargando(false)}
                onBuffer={onBuffer}
                onError={onError}
                onEnd={() => { reproductorRef.current?.seek?.(0); }}
                progressUpdateInterval={500}
                bufferConfig={{
                  minBufferMs: 5000,
                  maxBufferMs: 50000,
                  bufferForPlaybackMs: 2500,
                  bufferForPlaybackAfterRebufferMs: 5000,
                }}
                {...(Platform.OS === 'android' ? { viewType: androidViewType } : {})}
              />
              )}
            </View>

            {(cargando || buffering) && !mensajeError && (
              <View style={s.loadingOverlay}>
                <ActivityIndicator size="large" color="#C084FC" />
              </View>
            )}

            {mensajeError && (
              <View style={s.errorOverlay}>
                <Text style={s.errorText}>{mensajeError}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setMensajeError(null);
                    setCargando(true);
                    setBuffering(false);
                    setReintentoRender(0);
                    if (Platform.OS === 'android') {
                      setAndroidViewType(ViewType.TEXTURE);
                    }
                    reproductorRef.current?.seek?.(0);
                  }}
                  style={s.retryBtn}
                  activeOpacity={0.85}
                >
                  <Text style={s.retryBtnTxt}>{idioma === 'es' ? 'Reintentar' : 'Retry'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
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
                ) : item.soloImagen ? (
                  <Image source={item.fuente} style={s.thumb} resizeMode="cover" />
                ) : (
                  <LinearGradient colors={item.gradiente} style={s.thumbFallback}>
                    <Text style={s.thumbFallbackIcon}>{item.icono || '🎬'}</Text>
                  </LinearGradient>
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
  thumbFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbFallbackIcon: {
    fontSize: 30,
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
  playerTopBarPortrait: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerBodyPortrait: {
    paddingBottom: 0,
  },
  playerBodyLandscape: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    width: '100%',
    justifyContent: 'center',
  },
  videoFrame: {
    position: 'relative',
    backgroundColor: '#000',
  },
  videoFrameLandscape: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },
  videoFramePortrait: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  playerVideo: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
  playerTapZone: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    elevation: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  controlsLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
    elevation: 3,
  },
  playerTopBar: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerTopBarFloating: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 6,
  },
  cerrarBtn: { marginRight: 16 },
  cerrarTxt: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  playerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', flex: 1 },

  centerControlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 4,
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
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
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 6,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  sideControlStrip: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    elevation: 5,
  },
  errorOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: '42%',
    zIndex: 7,
    elevation: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  errorText: {
    textAlign: 'center',
    color: '#FDE68A',
    fontSize: 13,
    fontWeight: '600',
  },
  retryBtn: {
    alignSelf: 'center',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(192,132,252,0.24)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  retryBtnTxt: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  volumeCluster: {
    alignItems: 'center',
    gap: 10,
  },
  volumeStepBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  volumeStepBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  volumePercentTxt: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
    minWidth: 34,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  fullscreenSideBtn: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 6,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  fullscreenSideBtnText: {
    color: '#FFF',
    fontSize: 22,
    lineHeight: 26,
  },
  utilityBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  utilityBtnText: {
    color: '#FFF',
    fontSize: 16,
  },
  volumeSimpleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
  },
  volumeTrackVertical: {
    width: 12,
    height: 110,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.24)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  volumeFillVertical: {
    width: '100%',
    borderRadius: 6,
    backgroundColor: '#C084FC',
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
