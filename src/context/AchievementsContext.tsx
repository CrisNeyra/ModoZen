import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVE_LOGROS = '@ModoZen:logros_v1';

interface Logro {
  id: string;
  nombre_es: string;
  nombre_en: string;
  descripcion_es: string;
  descripcion_en: string;
  icono: string;
  desbloqueado: boolean;
  fecha?: string;
}

interface AchievementsContextType {
  logros: Logro[];
  logrosDesbloqueados: number;
  totalLogros: number;
  verificarLogros: (stats: {
    sesionesTotales: number;
    rachaActual: number;
    tiempoTotalMinutos: number;
    meditacionGuiadaUsada: boolean;
    meditacionTemporizadorUsada: boolean;
    meditacionRespiracionUsada: boolean;
  }) => Promise<void>;
}

const LOGROS_INICIALES: Logro[] = [
  {
    id: 'primera-sesion',
    nombre_es: 'Primer Paso',
    nombre_en: 'First Step',
    descripcion_es: 'Completaste tu primera sesión de meditación',
    descripcion_en: 'You completed your first meditation session',
    icono: '🌱',
    desbloqueado: false,
  },
  {
    id: 'racha-7',
    nombre_es: 'Semana Zen',
    nombre_en: 'Zen Week',
    descripcion_es: '7 días seguidos meditando',
    descripcion_en: '7 consecutive days of meditation',
    icono: '🔥',
    desbloqueado: false,
  },
  {
    id: 'racha-30',
    nombre_es: 'Maestro Zen',
    nombre_en: 'Zen Master',
    descripcion_es: '30 días seguidos meditando',
    descripcion_en: '30 consecutive days of meditation',
    icono: '🏆',
    desbloqueado: false,
  },
  {
    id: '100-minutos',
    nombre_es: 'Mente Calma',
    nombre_en: 'Calm Mind',
    descripcion_es: '100 minutos totales de meditación',
    descripcion_en: '100 total minutes of meditation',
    icono: '🧘',
    desbloqueado: false,
  },
  {
    id: '500-minutos',
    nombre_es: 'Océano de Paz',
    nombre_en: 'Ocean of Peace',
    descripcion_es: '500 minutos totales de meditación',
    descripcion_en: '500 total minutes of meditation',
    icono: '🌊',
    desbloqueado: false,
  },
  {
    id: '50-sesiones',
    nombre_es: 'Dedicación',
    nombre_en: 'Dedication',
    descripcion_es: '50 sesiones completadas',
    descripcion_en: '50 sessions completed',
    icono: '💎',
    desbloqueado: false,
  },
  {
    id: 'explorador',
    nombre_es: 'Explorador',
    nombre_en: 'Explorer',
    descripcion_es: 'Probaste todos los tipos de meditación',
    descripcion_en: 'You tried all types of meditation',
    icono: '🗺️',
    desbloqueado: false,
  },
  {
    id: 'nocturno',
    nombre_es: 'Meditador Nocturno',
    nombre_en: 'Night Meditator',
    descripcion_es: 'Meditaste después de las 10 PM',
    descripcion_en: 'You meditated after 10 PM',
    icono: '🌙',
    desbloqueado: false,
  },
];

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export const AchievementsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logros, setLogros] = useState<Logro[]>(LOGROS_INICIALES);

  const cargar = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(CLAVE_LOGROS);
      if (raw) {
        const guardados: Record<string, string> = JSON.parse(raw);
        setLogros(prev => prev.map(l => {
          if (guardados[l.id]) {
            return { ...l, desbloqueado: true, fecha: guardados[l.id] };
          }
          return l;
        }));
      }
    } catch {}
  }, []);

  const guardar = useCallback(async (logrosActualizados: Logro[]) => {
    try {
      const desbloqueados: Record<string, string> = {};
      logrosActualizados.forEach(l => {
        if (l.desbloqueado && l.fecha) {
          desbloqueados[l.id] = l.fecha;
        }
      });
      await AsyncStorage.setItem(CLAVE_LOGROS, JSON.stringify(desbloqueados));
    } catch {}
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const verificarLogros = useCallback(async (stats: {
    sesionesTotales: number;
    rachaActual: number;
    tiempoTotalMinutos: number;
    meditacionGuiadaUsada: boolean;
    meditacionTemporizadorUsada: boolean;
    meditacionRespiracionUsada: boolean;
  }) => {
    const ahora = new Date().toISOString();
    const horaActual = new Date().getHours();

    const actualizados = logros.map(l => {
      if (l.desbloqueado) return l;

      let desbloquear = false;

      switch (l.id) {
        case 'primera-sesion':
          desbloquear = stats.sesionesTotales >= 1;
          break;
        case 'racha-7':
          desbloquear = stats.rachaActual >= 7;
          break;
        case 'racha-30':
          desbloquear = stats.rachaActual >= 30;
          break;
        case '100-minutos':
          desbloquear = stats.tiempoTotalMinutos >= 100;
          break;
        case '500-minutos':
          desbloquear = stats.tiempoTotalMinutos >= 500;
          break;
        case '50-sesiones':
          desbloquear = stats.sesionesTotales >= 50;
          break;
        case 'explorador':
          desbloquear =
            stats.meditacionGuiadaUsada &&
            stats.meditacionTemporizadorUsada &&
            stats.meditacionRespiracionUsada;
          break;
        case 'nocturno':
          desbloquear = stats.sesionesTotales >= 1 && horaActual >= 22;
          break;
      }

      if (desbloquear) {
        return { ...l, desbloqueado: true, fecha: ahora };
      }
      return l;
    });

    const huboCambios = actualizados.some((l, i) => l.desbloqueado !== logros[i].desbloqueado);
    if (huboCambios) {
      setLogros(actualizados);
      await guardar(actualizados);
    }
  }, [logros, guardar]);

  const logrosDesbloqueados = logros.filter(l => l.desbloqueado).length;

  return (
    <AchievementsContext.Provider value={{
      logros,
      logrosDesbloqueados,
      totalLogros: logros.length,
      verificarLogros,
    }}>
      {children}
    </AchievementsContext.Provider>
  );
};

export const useAchievements = (): AchievementsContextType => {
  const ctx = useContext(AchievementsContext);
  if (!ctx) throw new Error('useAchievements debe usarse dentro de AchievementsProvider');
  return ctx;
};