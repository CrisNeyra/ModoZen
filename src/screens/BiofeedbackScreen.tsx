// ============================================================
// BiofeedbackScreen.tsx — Integración con wearables
// Muestra ritmo cardíaco, curva de relajación y conexión BLE.
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import ScreenHeader from '../components/ScreenHeader';


type Nav = NativeStackNavigationProp<ListaPantallas, 'Biofeedback'>;
interface Props { navigation: Nav; }

/**
 * Curva de relajación: simula un descenso de BPM.
 * En producción, esto leería de HealthKit / Health Connect vía:
 * - iOS: react-native-health (HealthKit)
 * - Android: react-native-health-connect (Health Connect API)
 *
 * Librerías recomendadas para 2026:
 * - @kingstinct/react-native-healthkit (HealthKit - iOS)
 * - react-native-health-connect (Health Connect - Android)
 * - react-native-ble-plx (BLE directo para wearables propios)
 */

const EJEMPLO_CURVA: number[] = [82, 80, 78, 76, 73, 71, 68, 66, 64, 63, 62, 61, 60, 60, 59];

const BiofeedbackScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useIdioma();
  const [conectado, setConectado] = useState(false);
  const [bpmActual, setBpmActual] = useState<number | null>(null);
  const [curvaRelajacion, setCurvaRelajacion] = useState<number[]>([]);

  const animCards = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Animated.stagger(120,
      animCards.map(a => Animated.spring(a, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }))
    ).start();
  }, [animCards]);

  useEffect(() => {
    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
      }
    };
  }, []);

  const simularConexion = useCallback(() => {
    setConectado(true);
    setBpmActual(78);
    let idx = 0;
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    intervaloRef.current = setInterval(() => {
      if (idx < EJEMPLO_CURVA.length) {
        setBpmActual(EJEMPLO_CURVA[idx]);
        setCurvaRelajacion(prev => [...prev, EJEMPLO_CURVA[idx]]);
        idx++;
      } else {
        if (intervaloRef.current) clearInterval(intervaloRef.current);
      }
    }, 2000);
  }, []);

  const maxBPM = Math.max(...(curvaRelajacion.length > 0 ? curvaRelajacion : [80]), 1);
  const minBPM = Math.min(...(curvaRelajacion.length > 0 ? curvaRelajacion : [60]));
  const descenso = curvaRelajacion.length > 1 ? curvaRelajacion[0] - curvaRelajacion[curvaRelajacion.length - 1] : 0;

  return (
    <View style={s.raiz}>
      <ScreenHeader
        titulo={t.biofeedbackTitulo || 'Biofeedback'}
        subtitulo={t.biofeedbackSub || 'Sincronización con wearables'}
        onBack={() => navigation.goBack()}
        textoVolver={`← ${t.volver}`}
      />

      <ScrollView contentContainerStyle={s.contenido} showsVerticalScrollIndicator={false}>
          {/* Estado de conexión */}
          <Animated.View style={{ opacity: animCards[0], transform: [{ translateY: animCards[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
            <View style={s.cardConexion}>
              <View style={s.cardRow}>
                <Text style={s.cardIcono}>{conectado ? '⌚' : '📱'}</Text>
                <View style={s.cardInfo}>
                  <Text style={s.cardTitulo}>{conectado ? (t.dispositivoConectado || 'Dispositivo conectado') : (t.sinDispositivo || 'Sin dispositivo')}</Text>
                  <Text style={s.cardSub}>{conectado ? 'Smartwatch • BLE' : (t.conectarDispositivo || 'Conectá tu smartwatch')}</Text>
                </View>
                <View style={[s.statusDot, conectado && s.statusDotActivo]} />
              </View>
              {!conectado && (
                <TouchableOpacity onPress={simularConexion} activeOpacity={0.8} style={s.btnConectar}>
                  <LinearGradient colors={['#EF4444', '#DC2626']} style={s.btnGrad}>
                    <Text style={s.btnTxt}>{t.conectar || 'Conectar'} ❤️</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {/* BPM actual */}
          {conectado && (
            <Animated.View style={{ opacity: animCards[1], transform: [{ translateY: animCards[1].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
              <LinearGradient colors={['rgba(239,68,68,0.2)', 'rgba(220,38,38,0.1)']} style={s.bpmCard}>
                <Text style={s.bpmLabel}>{t.ritmoCardiaco || 'Ritmo Cardíaco'}</Text>
                <View style={s.bpmRow}>
                  <Text style={s.bpmValor}>{bpmActual}</Text>
                  <Text style={s.bpmUnidad}>BPM</Text>
                </View>
                <Text style={s.bpmEmoji}>❤️‍🔥</Text>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Curva de relajación */}
          {curvaRelajacion.length > 1 && (
            <Animated.View style={{ opacity: animCards[2], transform: [{ translateY: animCards[2].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
              <View style={s.curvaCard}>
                <Text style={s.curvaTitulo}>{t.curvaRelajacion || 'Curva de Relajación'}</Text>
                <Text style={s.curvaSub}>{t.descensoBPM || 'Descenso'}: -{descenso} BPM</Text>
                
                {/* Gráfico de barras de BPM */}
                <View style={s.grafico}>
                  {curvaRelajacion.map((bpm, i) => {
                    const altPct = ((bpm - minBPM + 5) / (maxBPM - minBPM + 10)) * 100;
                    return (
                      <View key={i} style={s.graficoBarra}>
                        <LinearGradient
                          colors={bpm > 70 ? ['#EF4444', '#F87171'] : ['#10B981', '#34D399']}
                          style={[s.graficoBarraFill, { height: `${altPct}%` }]}
                        />
                        <Text style={s.graficoLabel}>{bpm}</Text>
                      </View>
                    );
                  })}
                </View>

                {/* Interpretación */}
                <View style={s.interpretacion}>
                  <Text style={s.interpretacionEmoji}>{descenso >= 10 ? '🏆' : descenso >= 5 ? '👍' : '🌱'}</Text>
                  <Text style={s.interpretacionTxt}>
                    {descenso >= 10
                      ? (t.relajacionExcelente || '¡Relajación excelente! Tu cuerpo respondió muy bien a la meditación.')
                      : descenso >= 5
                        ? (t.relajacionBuena || 'Buena relajación. Tu ritmo cardíaco descendió notablemente.')
                        : (t.relajacionInicial || 'Seguí practicando. Cada sesión mejora tu capacidad de relajación.')}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Info sobre integración */}
          <View style={s.infoCard}>
            <Text style={s.infoEmoji}>ℹ️</Text>
            <Text style={s.infoTitulo}>{t.compatibilidad || 'Compatibilidad'}</Text>
            <Text style={s.infoTxt}>
              {t.infoWearables || 'Compatible con Apple Watch (HealthKit), Wear OS y dispositivos con Health Connect. La lectura de BPM se realiza en tiempo real via Bluetooth.'}
            </Text>
            <View style={s.infoChips}>
              <View style={s.chip}><Text style={s.chipTxt}>Apple Watch</Text></View>
              <View style={s.chip}><Text style={s.chipTxt}>Wear OS</Text></View>
              <View style={s.chip}><Text style={s.chipTxt}>Fitbit</Text></View>
              <View style={s.chip}><Text style={s.chipTxt}>Garmin</Text></View>
            </View>
          </View>
        </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  raiz: { flex: 1 },
  contenido: { paddingHorizontal: 20, paddingBottom: 40 },
  cardConexion: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 20, marginTop: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardIcono: { fontSize: 32, marginRight: 14 },
  cardInfo: { flex: 1 },
  cardTitulo: { fontSize: 16, fontWeight: '600', color: '#FFF', fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium' },
  cardSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light' },
  statusDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.2)' },
  statusDotActivo: { backgroundColor: '#10B981' },
  btnConectar: { marginTop: 16, borderRadius: 16, overflow: 'hidden' },
  btnGrad: { paddingVertical: 14, alignItems: 'center', borderRadius: 16 },
  btnTxt: { color: '#FFF', fontSize: 16, fontWeight: '500', letterSpacing: 0.5 },
  bpmCard: {
    borderRadius: 24, padding: 28, marginTop: 16, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
  },
  bpmLabel: { fontSize: 13, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  bpmRow: { flexDirection: 'row', alignItems: 'baseline' },
  bpmValor: { fontSize: 64, fontWeight: '600', color: '#EF4444', fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium' },
  bpmUnidad: { fontSize: 18, color: 'rgba(255,255,255,0.5)', marginLeft: 8, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light' },
  bpmEmoji: { fontSize: 36, marginTop: 8 },
  curvaCard: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 20, marginTop: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  curvaTitulo: { fontSize: 18, fontWeight: '600', color: '#FFF', marginBottom: 4, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium' },
  curvaSub: { fontSize: 13, color: '#10B981', marginBottom: 16, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir' },
  grafico: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 4, marginBottom: 16 },
  graficoBarra: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  graficoBarraFill: { width: '80%', borderRadius: 4, minHeight: 4 },
  graficoLabel: { fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 4 },
  interpretacion: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.15)',
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
  },
  interpretacionEmoji: { fontSize: 28, marginRight: 12 },
  interpretacionTxt: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 19, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir' },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 22, marginTop: 20,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  infoEmoji: { fontSize: 28, marginBottom: 8 },
  infoTitulo: { fontSize: 16, fontWeight: '600', color: '#FFF', marginBottom: 8, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium' },
  infoTxt: { fontSize: 13, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 19, marginBottom: 14, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light' },
  infoChips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  chip: { backgroundColor: 'rgba(147,51,234,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(147,51,234,0.3)' },
  chipTxt: { fontSize: 12, color: '#C084FC', fontWeight: '500' },
});

export default BiofeedbackScreen;
