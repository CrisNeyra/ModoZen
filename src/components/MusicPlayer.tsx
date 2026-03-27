// ============================================================
// ReproductorMusica.tsx — Reproductor compacto estilo Spotify
// Diseño oscuro, controles centrados, lista expandible.
// Usa MusicPlayerContext para reproducción global persistente.
// ============================================================

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  LayoutChangeEvent,
  PanResponder,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useIdioma } from '../context/LanguageContext';
import { useMusicPlayer, PISTAS, Pista } from '../context/MusicPlayerContext';

const { width: ANCHO_PANTALLA } = Dimensions.get('window');
const ANCHO_REPRODUCTOR = ANCHO_PANTALLA - 40;

const formatearTiempo = (seg: number): string => {
  if (!seg || seg < 0) return '0:00';
  const m = Math.floor(seg / 60);
  const s = Math.floor(seg % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const limitar = (valor: number, min: number, max: number): number => Math.min(Math.max(valor, min), max);

// ============================================================
// Componente MusicPlayer — Spotify-style (UI only, audio via context)
// ============================================================
const MusicPlayer: React.FC = () => {
  const { t } = useIdioma();
  const {
    pistaIdx, reproduciendo, duracion, progreso, aleatorio, repetir, volumen, pista,
    setReproduciendo, setAleatorio, setRepetir, setVolumen,
    siguiente, anterior, seleccionar, seekTo, toggleReproduccion, nombrePista,
  } = useMusicPlayer();

  const [listaAbierta, setListaAbierta] = useState(false);
  const animLista = useRef(new Animated.Value(0)).current;
  const duracionRef = useRef(0);
  const anchoProgresoRef = useRef(0);
  const anchoVolumenRef = useRef(0);
  const [anchoProgreso, setAnchoProgreso] = useState(0);
  const [anchoVolumen, setAnchoVolumen] = useState(0);

  // Sliding tip animation — slow right-to-left loop
  const animTipX = useRef(new Animated.Value(ANCHO_PANTALLA)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(animTipX, {
        toValue: -ANCHO_PANTALLA * 1.5,
        duration: 15000,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [animTipX]);

  // Lista expandible
  const toggleLista = useCallback(() => {
    const abrir = !listaAbierta;
    setListaAbierta(abrir);
    Animated.spring(animLista, { toValue: abrir ? 1 : 0, useNativeDriver: false, tension: 50, friction: 9 }).start();
  }, [listaAbierta, animLista]);

  const alturaLista = animLista.interpolate({ inputRange: [0, 1], outputRange: [0, PISTAS.length * 36 + 8] });

  useEffect(() => {
    duracionRef.current = duracion;
  }, [duracion]);

  useEffect(() => {
    anchoProgresoRef.current = anchoProgreso;
  }, [anchoProgreso]);

  useEffect(() => {
    anchoVolumenRef.current = anchoVolumen;
  }, [anchoVolumen]);

  const handleSeleccionar = (idx: number) => {
    seleccionar(idx);
    if (listaAbierta) toggleLista();
  };

  const ajustarProgreso = useCallback((locationX: number) => {
    if (!duracionRef.current || anchoProgresoRef.current <= 0) return;
    const ratio = limitar(locationX / anchoProgresoRef.current, 0, 1);
    const nuevoTiempo = ratio * duracionRef.current;
    seekTo(nuevoTiempo);
  }, [seekTo]);

  const ajustarVolumen = useCallback((locationX: number) => {
    if (anchoVolumenRef.current <= 0) return;
    const ratio = limitar(locationX / anchoVolumenRef.current, 0, 1);
    setVolumen(ratio);
  }, [setVolumen]);

  const panResponderProgreso = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => duracionRef.current > 0,
      onMoveShouldSetPanResponder: () => duracionRef.current > 0,
      onPanResponderGrant: event => ajustarProgreso(event.nativeEvent.locationX),
      onPanResponderMove: event => ajustarProgreso(event.nativeEvent.locationX),
    })
  ).current;

  const panResponderVolumen = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: event => ajustarVolumen(event.nativeEvent.locationX),
      onPanResponderMove: event => ajustarVolumen(event.nativeEvent.locationX),
    })
  ).current;

  const medirAnchoProgreso = useCallback((event: LayoutChangeEvent) => {
    setAnchoProgreso(event.nativeEvent.layout.width);
  }, []);

  const medirAnchoVolumen = useCallback((event: LayoutChangeEvent) => {
    setAnchoVolumen(event.nativeEvent.layout.width);
  }, []);

  const barraW = duracion > 0 ? (progreso / duracion) * 100 : 0;

  return (
    <View style={s.contenedor}>
      {/* Card principal */}
      <View style={s.card}>
        {/* Track info con icono */}
        <View style={s.trackRow}>
          <Text style={s.trackEmoji}>{pista.icono}</Text>
          <View style={s.trackInfo}>
            <Text style={s.trackName}>{nombrePista(pista)}</Text>
            <Text style={s.trackArtist}>Modo Zen</Text>
          </View>
        </View>

        {/* Barra de progreso */}
        <View style={s.progressWrap}>
          <View style={s.progressArea} onLayout={medirAnchoProgreso} {...panResponderProgreso.panHandlers}>
            <View style={s.progressBg}>
              <View style={[s.progressFill, { width: `${barraW}%` }]} />
              <View style={[s.progressDot, { left: `${barraW}%` }]} />
            </View>
          </View>
          <View style={s.timeRow}>
            <Text style={s.timeText}>{formatearTiempo(progreso)}</Text>
            <Text style={s.timeText}>{formatearTiempo(duracion)}</Text>
          </View>
        </View>

        {/* Controles principales */}
        <View style={s.controls}>
          <TouchableOpacity onPress={() => setAleatorio(!aleatorio)} style={s.sideBtn}>
            <Text style={[s.sideBtnTxt, aleatorio && s.activeBtn]}>🔀</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={anterior} style={s.ctrlBtn}>
            <Text style={s.ctrlTxt}>⏮</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleReproduccion} style={s.playBtn}>
            <LinearGradient colors={['#9333EA', '#7C3AED']} style={s.playGrad}>
              <Text style={s.playIcon}>{reproduciendo ? '⏸' : '▶'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={siguiente} style={s.ctrlBtn}>
            <Text style={s.ctrlTxt}>⏭</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setRepetir(!repetir)} style={s.sideBtn}>
            <Text style={[s.sideBtnTxt, repetir && s.activeBtn]}>🔁</Text>
          </TouchableOpacity>
        </View>

        {/* Regulador de volumen */}
        <View style={s.volumeRow}>
          <TouchableOpacity onPress={() => setVolumen(Math.max(0, volumen - 0.1))} activeOpacity={0.6}>
            <Text style={s.volumeIcon}>−</Text>
          </TouchableOpacity>
          <View style={s.volumeBarWrap}>
            <View style={s.volumeTouchArea} onLayout={medirAnchoVolumen} {...panResponderVolumen.panHandlers}>
              <View style={s.volumeBarBg}>
                <View style={[s.volumeBarFill, { width: `${volumen * 100}%` }]} />
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={() => setVolumen(Math.min(1, volumen + 0.1))} activeOpacity={0.6}>
            <Text style={s.volumeIcon}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Tip — deslizable */}
        <View style={s.tipContainer}>
          <Animated.Text style={[s.tip, { transform: [{ translateX: animTipX }] }]}>
            🎧  {t.auricularesTip}  🎧
          </Animated.Text>
        </View>

        {/* Lista toggle */}
        <TouchableOpacity onPress={toggleLista} style={s.listToggle}>
          <Text style={s.listToggleTxt}>
            {t.listaReproduccion} ({PISTAS.length} {t.pistas}) {listaAbierta ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {/* Lista expandible */}
        <Animated.View style={[s.listContainer, { height: alturaLista }]}>
          {PISTAS.map((p, i) => (
            <TouchableOpacity key={p.id} style={[s.listItem, i === pistaIdx && s.listItemActive]}
              onPress={() => handleSeleccionar(i)} activeOpacity={0.65}>
              <Text style={s.listIcon}>{p.icono}</Text>
              <View style={s.listInfo}>
                <Text style={[s.listName, i === pistaIdx && s.listNameActive]} numberOfLines={1}>
                  {nombrePista(p)}
                </Text>
                <Text style={s.listSub}>Modo Zen</Text>
              </View>
              {i === pistaIdx && reproduciendo && (
                <View style={s.eqWrap}>
                  <View style={[s.eqBar, s.eqBar1]} />
                  <View style={[s.eqBar, s.eqBar2]} />
                  <View style={[s.eqBar, s.eqBar3]} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>
    </View>
  );
};

// ============================================================
// Estilos — Spotify-inspired dark theme
// ============================================================
const s = StyleSheet.create({
  contenedor: { alignItems: 'center', marginVertical: 4 },

  card: {
    width: ANCHO_REPRODUCTOR,
    backgroundColor: 'rgba(26, 26, 46, 0.80)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(147,51,234,0.15)',
  },

  // --- Track row (icono + info en línea) ---
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6,
  },
  trackEmoji: { fontSize: 28, marginRight: 12, color: '#FFFFFF', textShadowColor: 'rgba(255,255,255,0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4 },
  trackInfo: { flex: 1 },

  // --- Track info ---
  trackName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  trackArtist: {
    fontSize: 11,
    color: '#B3B3B3',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir',
    marginTop: 1,
  },

  // --- Progress bar ---
  progressWrap: { width: '100%', marginBottom: 2 },
  progressArea: {
    width: '100%',
    paddingVertical: 10,
    marginVertical: -10,
    justifyContent: 'center',
  },
  progressBg: {
    height: 3,
    backgroundColor: '#535353',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9333EA',
    borderRadius: 2,
  },
  progressDot: {
    position: 'absolute',
    top: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9333EA',
    marginLeft: -4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  timeText: {
    fontSize: 9,
    color: '#B3B3B3',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir',
  },

  // --- Controls ---
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 4,
    gap: 14,
  },
  sideBtn: {
    padding: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(147,51,234,0.2)',
    backgroundColor: 'rgba(147,51,234,0.08)',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideBtnTxt: { fontSize: 16, opacity: 0.4, color: '#FFFFFF', textShadowColor: 'rgba(255,255,255,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 },
  activeBtn: { opacity: 1, borderColor: '#9333EA', backgroundColor: 'rgba(147,51,234,0.2)' },
  ctrlBtn: { padding: 6 },
  ctrlTxt: { fontSize: 22, color: '#FFFFFF', textShadowColor: 'rgba(255,255,255,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  playGrad: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 2,
  },

  // --- Tip (sliding) ---
  tipContainer: {
    width: '100%',
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 4,
    height: 24,
  },
  tip: {
    fontSize: 15,
    color: '#C084FC',
    fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
    position: 'absolute',
    width: ANCHO_PANTALLA * 2,
    letterSpacing: 0.5,
  },

  // --- List toggle ---
  listToggle: { paddingVertical: 4, alignItems: 'center' },
  listToggleTxt: {
    fontSize: 11,
    color: '#B3B3B3',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },

  // --- Track list ---
  listContainer: { overflow: 'hidden', width: '100%' },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 1,
  },
  listItemActive: { backgroundColor: 'rgba(147,51,234,0.15)' },
  listIcon: { fontSize: 14, marginRight: 8, color: '#FFFFFF', textShadowColor: 'rgba(255,255,255,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 },
  listInfo: { flex: 1 },
  listName: {
    fontSize: 11,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir',
  },
  listNameActive: { color: '#9333EA', fontWeight: '600' },
  listSub: {
    fontSize: 9,
    color: '#535353',
    marginTop: 1,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir',
  },

  // --- Equalizer bars (playing indicator) ---
  eqWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 1.5, height: 10, marginLeft: 6 },
  eqBar: { width: 2, backgroundColor: '#9333EA', borderRadius: 1 },
  eqBar1: { height: 6 },
  eqBar2: { height: 10 },
  eqBar3: { height: 4 },

  // --- Volume slider ---
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  volumeIcon: { fontSize: 14, color: '#FFFFFF', marginHorizontal: 4 },
  volumeBarWrap: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  volumeTouchArea: {
    width: '100%',
    paddingVertical: 10,
    marginVertical: -10,
    justifyContent: 'center',
  },
  volumeBarBg: {
    height: 3,
    backgroundColor: '#535353',
    borderRadius: 2,
    overflow: 'hidden',
  },
  volumeBarFill: {
    height: '100%',
    backgroundColor: '#9333EA',
    borderRadius: 2,
  },
});

export default MusicPlayer;
