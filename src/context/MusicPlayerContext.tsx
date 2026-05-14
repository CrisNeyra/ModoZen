// ============================================================
// MusicPlayerContext.tsx — Contexto global del reproductor
// Mantiene la reproducción de música entre pantallas.
// ============================================================

import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import Video, { OnLoadData, SelectedVideoTrackType, ViewType } from 'react-native-video';
import { useIdioma } from './LanguageContext';
import { useAuth } from './AuthContext';

export interface Pista {
  id: string;
  nombre_es: string;
  nombre_en: string;
  icono: string;
  fuente: any;
}

export const PISTAS: Pista[] = [
  { id: '2', nombre_es: 'Olas de mar Zen', nombre_en: 'Zen Ocean Waves', icono: '🌊', fuente: require('../assets/audio/Olas en el Alma.mp3') },
  { id: '1', nombre_es: 'Lluvia suave', nombre_en: 'Soft Rain', icono: '🌧️', fuente: require('../assets/audio/lluvia suave.mp3') },
  { id: '3', nombre_es: 'Bosque tranquilo', nombre_en: 'Peaceful Forest', icono: '🌿', fuente: require('../assets/audio/Meditacion en el Bosque.mp3') },
  { id: '4', nombre_es: 'Fogata crepitante', nombre_en: 'Crackling Fire', icono: '🔥', fuente: require('../assets/audio/Fogata.mp3') },
  { id: '5', nombre_es: 'Cuencos', nombre_en: 'Singing Bowls', icono: '🔔', fuente: require('../assets/audio/Cuencos.mp3') },
];

interface MusicPlayerState {
  pistaIdx: number;
  reproduciendo: boolean;
  duracion: number;
  progreso: number;
  aleatorio: boolean;
  repetir: boolean;
  volumen: number;
  pista: Pista;
}

interface MusicPlayerActions {
  setPistaIdx: (idx: number) => void;
  setReproduciendo: (val: boolean) => void;
  toggleReproduccion: () => void;
  setVolumen: (vol: number) => void;
  setAleatorio: (val: boolean) => void;
  setRepetir: (val: boolean) => void;
  siguiente: () => void;
  anterior: () => void;
  seleccionar: (idx: number, options?: { autoplay?: boolean; resetProgress?: boolean }) => void;
  seekTo: (time: number) => void;
  nombrePista: (p: Pista) => string;
}

type MusicPlayerContextType = MusicPlayerState & MusicPlayerActions;

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { idioma } = useIdioma();
  const { estaLogueado } = useAuth();
  const [pistaIdx, setPistaIdx] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [duracion, setDuracion] = useState(0);
  const [progreso, setProgreso] = useState(0);
  const [aleatorio, setAleatorio] = useState(false);
  const [repetir, setRepetir] = useState(false);
  const [volumen, setVolumen] = useState(1.0);
  const reproductorRef = useRef<any>(null);

  const pista = PISTAS[pistaIdx];
  const nombrePista = useCallback((p: Pista) => idioma === 'es' ? p.nombre_es : p.nombre_en, [idioma]);

  const siguiente = useCallback(() => {
    if (aleatorio) {
      let idx = pistaIdx;
      while (idx === pistaIdx && PISTAS.length > 1) idx = Math.floor(Math.random() * PISTAS.length);
      setPistaIdx(idx);
    } else {
      setPistaIdx((pistaIdx + 1) % PISTAS.length);
    }
    setProgreso(0);
  }, [pistaIdx, aleatorio]);

  const anterior = useCallback(() => {
    if (progreso > 3) {
      setProgreso(0);
      reproductorRef.current?.seek?.(0);
      return;
    }
    setPistaIdx((pistaIdx - 1 + PISTAS.length) % PISTAS.length);
    setProgreso(0);
  }, [pistaIdx, progreso]);

  const seleccionar = useCallback((idx: number, options?: { autoplay?: boolean; resetProgress?: boolean }) => {
    const autoplay = options?.autoplay ?? true;
    const resetProgress = options?.resetProgress ?? true;
    setPistaIdx(idx);
    if (autoplay) setReproduciendo(true);
    if (resetProgress) setProgreso(0);
  }, []);

  const toggleReproduccion = useCallback(() => {
    setReproduciendo(prev => !prev);
  }, []);

  const seekTo = useCallback((time: number) => {
    setProgreso(time);
    reproductorRef.current?.seek?.(time);
  }, []);

  const alCargar = useCallback((data: OnLoadData) => setDuracion(data.duration), []);
  const alAvanzar = useCallback((data: { currentTime: number }) => setProgreso(data.currentTime), []);

  return (
    <MusicPlayerContext.Provider value={{
      pistaIdx, reproduciendo, duracion, progreso, aleatorio, repetir, volumen, pista,
      setPistaIdx, setReproduciendo, toggleReproduccion, setVolumen, setAleatorio, setRepetir,
      siguiente, anterior, seleccionar, seekTo, nombrePista,
    }}>
      {/* Solo con sesión iniciada: evita 2× ExoPlayer en Login/Home (rompe fondos en Android). */}
      {estaLogueado ? (
        <Video
          ref={reproductorRef}
          source={pista.fuente}
          paused={!reproduciendo}
          repeat={repetir}
          volume={volumen}
          muted={false}
          playInBackground
          playWhenInactive
          ignoreSilentSwitch="ignore"
          mixWithOthers="mix"
          selectedVideoTrack={{ type: SelectedVideoTrackType.DISABLED }}
          onLoad={alCargar}
          onProgress={alAvanzar}
          onEnd={() => { if (!repetir) siguiente(); }}
          style={{ width: 0, height: 0, position: 'absolute', opacity: 0 }}
          {...(Platform.OS === 'android' ? { viewType: ViewType.TEXTURE } : {})}
        />
      ) : null}
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = (): MusicPlayerContextType => {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error('useMusicPlayer debe usarse dentro de MusicPlayerProvider');
  return ctx;
};
