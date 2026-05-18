// ============================================================
// StatsContext.tsx — Contexto de estadísticas de meditación
// Gestiona racha de días, minutos hoy y sesiones totales.
// Persiste en AsyncStorage con clave unificada.
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVE_STATS = '@ModoZen:stats_v2';

interface SesionRegistrada {
  sessionId: string;
  date: string;
  durationSeconds: number;
  moodBefore?: string | null;
  moodAfter?: string | null;
  rating?: number;
  note?: string;
}

interface StatsData {
  sesiones: SesionRegistrada[];
  ultimoDia: string | null; // ISO date string de último día activo
}

interface StatsComputed {
  diasSeguidos: number;
  minutosHoy: number;
  sesionesTotales: number;
  tiempoTotalMinutos: number;
  rachaActual: number;
  mejorRacha: number;
  sesionesPorDia: Record<string, number>; // 'YYYY-MM-DD' → minutos
  meditacionGuiadaUsada: boolean;
  meditacionTemporizadorUsada: boolean;
  meditacionRespiracionUsada: boolean;
}

interface StatsContextType extends StatsComputed {
  registrarSesion: (sesion: Omit<SesionRegistrada, 'date'>) => Promise<void>;
  recargar: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

const hoyISO = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const ayerISO = (fecha: string): string => {
  const d = new Date(fecha + 'T12:00:00');
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const calcularStats = (data: StatsData): StatsComputed => {
  const hoy = hoyISO();
  const sesionesPorDia: Record<string, number> = {};

  // Agrupar sesiones por día
  for (const s of data.sesiones) {
    const dia = s.date.slice(0, 10);
    sesionesPorDia[dia] = (sesionesPorDia[dia] || 0) + Math.round(s.durationSeconds / 60);
  }

  // Minutos hoy
  const minutosHoy = sesionesPorDia[hoy] || 0;

  // Sesiones totales
  const sesionesTotales = data.sesiones.length;

  // Tiempo total
  const tiempoTotalMinutos = data.sesiones.reduce((acc, s) => acc + Math.round(s.durationSeconds / 60), 0);

  // Calcular racha: días consecutivos incluyendo hoy
  const diasUnicos = [...new Set(data.sesiones.map(s => s.date.slice(0, 10)))].sort().reverse();
  let rachaActual = 0;
  let diaCheck = hoy;

  // Si hoy no tiene sesiones, verificar si ayer tenía (racha desde ayer)
  if (!diasUnicos.includes(hoy)) {
    const ayer = ayerISO(hoy);
    if (diasUnicos.includes(ayer)) {
      diaCheck = ayer;
    } else {
      // Sin racha
      rachaActual = 0;
    }
  }

  if (diasUnicos.includes(diaCheck)) {
    let cursor = diaCheck;
    while (diasUnicos.includes(cursor)) {
      rachaActual++;
      cursor = ayerISO(cursor);
    }
  }

  // Mejor racha histórica
  let mejorRacha = 0;
  let rachaTemp = 0;
  const diasOrdenados = [...new Set(data.sesiones.map(s => s.date.slice(0, 10)))].sort();
  for (let i = 0; i < diasOrdenados.length; i++) {
    if (i === 0) {
      rachaTemp = 1;
    } else {
      const prev = new Date(diasOrdenados[i - 1] + 'T12:00:00');
      const curr = new Date(diasOrdenados[i] + 'T12:00:00');
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (Math.round(diff) === 1) {
        rachaTemp++;
      } else {
        rachaTemp = 1;
      }
    }
    if (rachaTemp > mejorRacha) mejorRacha = rachaTemp;
  }
  if (rachaActual > mejorRacha) mejorRacha = rachaActual;

  const meditacionGuiadaUsada = data.sesiones.some(s => /^[1-6]$/.test(s.sessionId));
  const meditacionTemporizadorUsada = data.sesiones.some(s => s.sessionId.startsWith('timer-'));
  const meditacionRespiracionUsada = data.sesiones.some(s => s.sessionId.startsWith('respiracion-'));

  return {
    diasSeguidos: rachaActual,
    minutosHoy,
    sesionesTotales,
    tiempoTotalMinutos,
    rachaActual,
    mejorRacha,
    sesionesPorDia,
    meditacionGuiadaUsada,
    meditacionTemporizadorUsada,
    meditacionRespiracionUsada,
  };
};

export const StatsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [, setData] = useState<StatsData>({ sesiones: [], ultimoDia: null });
  const [computed, setComputed] = useState<StatsComputed>({
    diasSeguidos: 0, minutosHoy: 0, sesionesTotales: 0,
    tiempoTotalMinutos: 0, rachaActual: 0, mejorRacha: 0, sesionesPorDia: {},
    meditacionGuiadaUsada: false, meditacionTemporizadorUsada: false, meditacionRespiracionUsada: false,
  });

  const cargar = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(CLAVE_STATS);
      if (raw) {
        const parsed: StatsData = JSON.parse(raw);
        setData(parsed);
        setComputed(calcularStats(parsed));
      }
    } catch {}
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const registrarSesion = useCallback(async (sesion: Omit<SesionRegistrada, 'date'>) => {
    try {
      const raw = await AsyncStorage.getItem(CLAVE_STATS);
      const current: StatsData = raw ? JSON.parse(raw) : { sesiones: [], ultimoDia: null };
      const nueva: SesionRegistrada = { ...sesion, date: new Date().toISOString() };
      current.sesiones.push(nueva);
      current.ultimoDia = hoyISO();
      await AsyncStorage.setItem(CLAVE_STATS, JSON.stringify(current));
      setData(current);
      setComputed(calcularStats(current));
    } catch {}
  }, []);

  return (
    <StatsContext.Provider value={{ ...computed, registrarSesion, recargar: cargar }}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = (): StatsContextType => {
  const ctx = useContext(StatsContext);
  if (!ctx) throw new Error('useStats debe usarse dentro de StatsProvider');
  return ctx;
};
