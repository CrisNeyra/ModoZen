import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVE_FAVORITOS = '@ModoZen:favoritos_v1';

interface FavoritosData {
  sesiones: string[];
  sonidos: string[];
  videos: string[];
}

interface FavoritesContextType extends FavoritosData {
  toggleSesion: (id: string) => Promise<void>;
  toggleSonido: (id: string) => Promise<void>;
  toggleVideo: (id: string) => Promise<void>;
  esFavoritoSesion: (id: string) => boolean;
  esFavoritoSonido: (id: string) => boolean;
  esFavoritoVideo: (id: string) => boolean;
  recargar: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favoritos, setFavoritos] = useState<FavoritosData>({
    sesiones: [],
    sonidos: [],
    videos: [],
  });

  const cargar = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(CLAVE_FAVORITOS);
      if (raw) setFavoritos(JSON.parse(raw));
    } catch {}
  }, []);

  const guardar = useCallback(async (data: FavoritosData) => {
    try {
      await AsyncStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(data));
      setFavoritos(data);
    } catch {}
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const toggleSesion = useCallback(async (id: string) => {
    const sesiones = favoritos.sesiones.includes(id)
      ? favoritos.sesiones.filter(s => s !== id)
      : [...favoritos.sesiones, id];
    await guardar({ ...favoritos, sesiones });
  }, [favoritos, guardar]);

  const toggleSonido = useCallback(async (id: string) => {
    const sonidos = favoritos.sonidos.includes(id)
      ? favoritos.sonidos.filter(s => s !== id)
      : [...favoritos.sonidos, id];
    await guardar({ ...favoritos, sonidos });
  }, [favoritos, guardar]);

  const toggleVideo = useCallback(async (id: string) => {
    const videos = favoritos.videos.includes(id)
      ? favoritos.videos.filter(v => v !== id)
      : [...favoritos.videos, id];
    await guardar({ ...favoritos, videos });
  }, [favoritos, guardar]);

  const esFavoritoSesion = useCallback((id: string) => favoritos.sesiones.includes(id), [favoritos.sesiones]);
  const esFavoritoSonido = useCallback((id: string) => favoritos.sonidos.includes(id), [favoritos.sonidos]);
  const esFavoritoVideo = useCallback((id: string) => favoritos.videos.includes(id), [favoritos.videos]);

  return (
    <FavoritesContext.Provider value={{
      ...favoritos,
      toggleSesion,
      toggleSonido,
      toggleVideo,
      esFavoritoSesion,
      esFavoritoSonido,
      esFavoritoVideo,
      recargar: cargar,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites debe usarse dentro de FavoritesProvider');
  return ctx;
};
