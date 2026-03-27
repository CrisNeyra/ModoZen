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
import { useIdioma } from '../context/LanguageContext';
import { useStats } from '../context/StatsContext';



type Nav = NativeStackNavigationProp<any>;
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
  const { t } = useIdioma();
  const { tiempoTotalMinutos, sesionesTotales, rachaActual, mejorRacha, sesionesPorDia } = useStats();

  const stats: Stats = {
    tiempoTotal: tiempoTotalMinutos,
    sesionesTotales,
    rachaActual,
    mejorRacha,
  };

  // Animaciones
  const animHeader = useRef(new Animated.Value(0)).current;
  const animCards = useRef(STAT_CONFIGS.map(() => new Animated.Value(0))).current;
  const animSemanal = useRef(new Animated.Value(0)).current;
  const animBarras = useRef([0, 1, 2, 3, 4, 5, 6].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Animaciones de entrada
    Animated.timing(animHeader, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.stagger(80,
      animCards.map(a => Animated.spring(a, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }))
    ).start();
    setTimeout(() => {
      Animated.timing(animSemanal, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      Animated.stagger(80,
        animBarras.map(a => Animated.spring(a, { toValue: 1, tension: 40, friction: 6, useNativeDriver: false }))
      ).start();
    }, 400);
  }, [animHeader, animCards, animSemanal, animBarras]);

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

  const diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  // Calcular minutos por día de la semana actual
  const minutosSemanales = useMemo(() => {
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0=Dom, 1=Lun, ...
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((diaSemana + 6) % 7));
    const resultado: number[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      resultado.push(sesionesPorDia[key] || 0);
    }
    return resultado;
  }, [sesionesPorDia]);

  const maxMinSemana = Math.max(...minutosSemanales, 1);

  return (
    <View style={s.raiz}>
      <LinearGradient colors={['#0F0F23', '#1A1A2E', '#16213E']} style={s.fondo}>
        {/* Encabezado */}
        <Animated.View style={[s.header, {
          opacity: animHeader,
          transform: [{ translateY: animHeader.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
            <Text style={s.backTxt}>← {t.volver}</Text>
          </TouchableOpacity>
          <Text style={s.titulo}>{t.tituloProgreso}</Text>
          <Text style={s.sub}>{t.subtituloProgreso}</Text>
        </Animated.View>

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

          {/* Resumen semanal */}
          <Animated.View style={{ opacity: animSemanal }}>
            <Text style={s.seccion}>{t.resumenSemanal}</Text>
            <View style={s.semanalCard}>
              {diasSemana.map((d, i) => (
                <View key={i} style={s.diaCol}>
                  <View style={s.diaBarContainer}>
                    <Animated.View style={[s.diaBar, {
                      height: animBarras[i].interpolate({ inputRange: [0, 1], outputRange: [4, Math.max(4, (minutosSemanales[i] / maxMinSemana) * 56)] }),
                    }]}>
                      <LinearGradient colors={['#9333EA', '#C084FC']} style={s.diaBarGrad} />
                    </Animated.View>
                  </View>
                  <Text style={s.diaLetra}>{d}</Text>
                </View>
              ))}
            </View>
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
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const s = StyleSheet.create({
  raiz: { flex: 1 },
  fondo: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 16 },
  backBtn: {
    marginBottom: 16, backgroundColor: 'rgba(147,51,234,0.15)', alignSelf: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(147,51,234,0.3)',
  },
  backTxt: {
    color: '#C084FC', fontSize: 15, fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  titulo: {
    fontSize: 28, fontWeight: '600', color: '#FFF', letterSpacing: 0.5,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  sub: {
    fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 4,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
  },
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
});

export default ProgresoScreen;
