// ============================================================
// PantallaProgreso.tsx — Estadísticas de meditación
// Mejorada con gradientes animados, gráficos visuales.
// ============================================================

import React, { useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ListaPantallas } from '../navigation/AppNavigator'
import { useIdioma } from '../context/LanguageContext';
import { useStats } from '../context/StatsContext';
import { useTheme } from '../context/ThemeContext';
import { useAchievements } from '../context/AchievementsContext';
import Dashboard from '../components/Dashboard';
import ScreenHeader from '../components/ScreenHeader';



type Nav = NativeStackNavigationProp<ListaPantallas, 'Progreso'>;
interface Props { navigation: Nav; }

interface Stats {
  tiempoTotal: number;
  sesionesTotales: number;
  rachaActual: number;
  mejorRacha: number;
}

const STAT_CONFIGS = [
  { key: 'tiempoTotal' as const, icono: '⏱️', grad: ['#3B82F6', '#1D4ED8'] },
  { key: 'sesionesTotales' as const, icono: '🧘', grad: ['#8B5CF6', '#6D28D9'] },
  { key: 'rachaActual' as const, icono: '🔥', grad: ['#F97316', '#EA580C'] },
  { key: 'mejorRacha' as const, icono: '🏆', grad: ['#F59E0B', '#D97706'] },
];

const ProgresoScreen: React.FC<Props> = ({ navigation }) => {
  const { t, idioma } = useIdioma();
  const { theme } = useTheme();
  const {
    tiempoTotalMinutos,
    sesionesTotales,
    rachaActual,
    mejorRacha,
    sesionesPorDia,
    meditacionGuiadaUsada,
    meditacionTemporizadorUsada,
    meditacionRespiracionUsada,
  } = useStats();
  const { logros, logrosDesbloqueados, totalLogros, verificarLogros } = useAchievements();

  const stats: Stats = {
    tiempoTotal: tiempoTotalMinutos,
    sesionesTotales,
    rachaActual,
    mejorRacha,
  };

  useEffect(() => {
    verificarLogros({
      sesionesTotales: stats.sesionesTotales,
      rachaActual: stats.rachaActual,
      tiempoTotalMinutos: stats.tiempoTotal,
      meditacionGuiadaUsada,
      meditacionTemporizadorUsada,
      meditacionRespiracionUsada,
    });
  }, [
    sesionesTotales,
    rachaActual,
    tiempoTotalMinutos,
    meditacionGuiadaUsada,
    meditacionTemporizadorUsada,
    meditacionRespiracionUsada,
  ]);

  // Animaciones
  const animCards = useRef(STAT_CONFIGS.map(() => new Animated.Value(0))).current;
  const animSemanal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(80,
      animCards.map(a => Animated.spring(a, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }))
    ).start();
    setTimeout(() => {
      Animated.timing(animSemanal, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 400);
  }, [animCards, animSemanal]);

  const labelsTraducidos = {
    tiempoTotal: t.tiempoTotal,
    sesionesTotales: t.sesionesTotales,
    rachaActual: t.rachaActual,
    mejorRacha: t.mejorRacha,
  };

  const valoresFormateados = {
    tiempoTotal: `${stats.tiempoTotal} ${t.minutos}`,
    sesionesTotales: `${stats.sesionesTotales}`,
    rachaActual: `${stats.rachaActual} ${t.dias}`,
    mejorRacha: `${stats.mejorRacha} ${t.dias}`,
  };

  

  return (
    <View style={s.raiz}>
      <LinearGradient colors={theme.fondoGradiente} style={s.fondo}>
        <ScreenHeader
          titulo={t.tituloProgreso}
          subtitulo={t.subtituloProgreso}
          onBack={() => navigation.goBack()}
          textoVolver={`← ${t.volver}`}
        />

        <ScrollView contentContainerStyle={s.contenido} showsVerticalScrollIndicator={false}>
          {/* Grid de estadísticas */}
          <View style={s.grid}>
            {STAT_CONFIGS.map((cfg, i) => (
              <Animated.View key={cfg.key} style={[s.statCardWrap, {
                opacity: animCards[i],
                transform: [{ scale: animCards[i].interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
              }]}>
                <LinearGradient colors={cfg.grad} style={s.statCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={s.statIcono}>{cfg.icono}</Text>
                  <Text style={s.statValor}>{valoresFormateados[cfg.key]}</Text>
                  <Text style={s.statLabel}>{labelsTraducidos[cfg.key]}</Text>
                </LinearGradient>
              </Animated.View>
            ))}
          </View>

          {/* Dashboard semanal */}
          <Animated.View style={{ opacity: animSemanal }}>
            <Dashboard sesionesPorDia={sesionesPorDia} />
          </Animated.View>

          {/* Empty state */}
          {stats.sesionesTotales === 0 && (
            <Animated.View style={[s.emptyCard, { opacity: animSemanal }]}>
              <Text style={s.emptyEmoji}>🌱</Text>
              <Text style={s.emptyTitulo}>{t.sinDatosTodavia}</Text>
              <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
                <LinearGradient colors={['#9333EA', '#7C3AED']} style={s.emptyBtn}>
                  <Text style={s.emptyBtnTxt}>🧘 Comenzar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Logros */}
          <View style={s.logrosSeccion}>
            <Text style={s.logrosTitulo}>
              {idioma === 'es' ? '🏅 Logros' : '🏅 Achievements'}
              <Text style={s.logrosContador}> ({logrosDesbloqueados}/{totalLogros})</Text>
            </Text>
            <View style={s.logrosGrid}>
              {logros.map(logro => (
                <View key={logro.id} style={[s.logroCard, !logro.desbloqueado && s.logroBloqueado]}>
                  <Text style={[s.logroIcono, !logro.desbloqueado && s.logroIconoBloqueado]}>
                    {logro.desbloqueado ? logro.icono : '🔒'}
                  </Text>
                  <Text style={[s.logroNombre, !logro.desbloqueado && s.logroNombreBloqueado]}>
                    {idioma === 'es' ? logro.nombre_es : logro.nombre_en}
                  </Text>
                  <Text style={[s.logroDesc, !logro.desbloqueado && s.logroDescBloqueado]} numberOfLines={2}>
                    {logro.desbloqueado
                      ? (idioma === 'es' ? logro.descripcion_es : logro.descripcion_en)
                      : (idioma === 'es' ? 'Bloqueado' : 'Locked')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const s = StyleSheet.create({
  raiz: { flex: 1 },
  fondo: { flex: 1 },
  contenido: { paddingHorizontal: 20, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 },
  statCardWrap: { width: '48%', marginBottom: 12 },
  statCard: {
    borderRadius: 20, padding: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  statIcono: { fontSize: 30, marginBottom: 10 },
  statValor: {
    fontSize: 24, fontWeight: '600', color: '#FFF',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  statLabel: {
    fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 6, textAlign: 'center',
    textTransform: 'uppercase', letterSpacing: 0.5,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir',
  },
  seccion: {
    fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.35)', marginTop: 28, marginBottom: 14,
    letterSpacing: 2, textTransform: 'uppercase',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  semanalCard: {
    flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  diaCol: { alignItems: 'center', flex: 1 },
  diaBarContainer: { height: 60, justifyContent: 'flex-end', marginBottom: 8 },
  diaBar: { width: 8, borderRadius: 4, overflow: 'hidden', minHeight: 4 },
  diaBarGrad: { flex: 1, borderRadius: 4 },
  diaLetra: {
    fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir',
  },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 24, padding: 36, alignItems: 'center',
    marginTop: 28, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)', borderStyle: 'dashed',
  },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitulo: {
    fontSize: 15, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 22, marginBottom: 20,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
  },
  emptyBtn: {
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: 18,
    shadowColor: '#9333EA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  emptyBtnTxt: {
    color: '#FFF', fontSize: 16, fontWeight: '500', letterSpacing: 0.5,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  logrosSeccion: { marginTop: 28 },
  logrosTitulo: {
    fontSize: 18, fontWeight: '700', color: '#FFF', marginBottom: 16,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  logrosContador: {
    fontSize: 14, fontWeight: '400', color: 'rgba(255,255,255,0.4)',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir',
  },
  logrosGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  logroCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  logroBloqueado: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.04)',
  },
  logroIcono: { fontSize: 32, marginBottom: 8 },
  logroIconoBloqueado: { opacity: 0.3 },
  logroNombre: {
    fontSize: 13, fontWeight: '600', color: '#FFF', textAlign: 'center', marginBottom: 4,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  logroNombreBloqueado: { color: 'rgba(255,255,255,0.3)' },
  logroDesc: {
    fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 15,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
  },
  logroDescBloqueado: { color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' },
});

export default ProgresoScreen;
