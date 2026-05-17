import React, { useState, useMemo } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { ListaPantallas } from '../navigation/AppNavigator'
import { useTheme } from '../context/ThemeContext'
import CircularTimer from '../components/CircularTimer'

const { width: W } = Dimensions.get('window')
type Nav = NativeStackNavigationProp<ListaPantallas, 'Temporizador'>
interface Props { navigation: Nav }

const DURACIONES = [
  { label: '3 min', value: 3, emoji: '🫁' },
  { label: '5 min', value: 5, emoji: '🧘' },
  { label: '10 min', value: 10, emoji: '🌊' },
  { label: '15 min', value: 15, emoji: '🌙' },
]

const TemporizadorScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, themeMode } = useTheme()
  const [duracion, setDuracion] = useState<number>(5)
  const [iniciado, setIniciado] = useState(false)

  const timerKey = useMemo(() => `timer-${duracion}-${Date.now()}`, [duracion, iniciado])

  const esOscuro = themeMode === 'dark'
  const s = crearEstilos(theme, esOscuro)

  return (
    <View style={s.raiz}>
      <LinearGradient colors={theme.fondoGradiente} style={s.fondo}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
            <Text style={s.backTxt}>← Volver</Text>
          </TouchableOpacity>
          <Text style={s.titulo}>⏱ Temporizador</Text>
          <Text style={s.sub}>Relajación con cuenta regresiva</Text>
        </View>

        <ScrollView contentContainerStyle={s.contenido} showsVerticalScrollIndicator={false}>
          {!iniciado ? (
            <>
              <View style={s.selectorCard}>
                <Text style={s.selectorTitulo}>Elegí la duración</Text>
                <View style={s.duraGrid}>
                  {DURACIONES.map(d => (
                    <TouchableOpacity
                      key={d.value}
                      style={[s.duraBtn, duracion === d.value && s.duraBtnActivo]}
                      onPress={() => setDuracion(d.value)}
                      activeOpacity={0.8}
                    >
                      <Text style={s.duraEmoji}>{d.emoji}</Text>
                      <Text style={[s.duraLabel, duracion === d.value && s.duraLabelActivo]}>
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={s.comenzarBtn} onPress={() => setIniciado(true)} activeOpacity={0.85}>
                  <LinearGradient colors={[theme.primario, theme.primarioOscuro]} style={s.comenzarGrad}>
                    <Text style={s.comenzarTexto}>▶ Comenzar</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={s.infoCard}>
                <Text style={s.infoTitulo}>Tips para tu sesión</Text>
                <View style={s.infoItem}>
                  <Text style={s.infoIcon}>🎧</Text>
                  <Text style={s.infoText}>Usá auriculares para mejor experiencia</Text>
                </View>
                <View style={s.infoItem}>
                  <Text style={s.infoIcon}>🪑</Text>
                  <Text style={s.infoText}>Sentate en un lugar cómodo y tranquilo</Text>
                </View>
                <View style={s.infoItem}>
                  <Text style={s.infoIcon}>📵</Text>
                  <Text style={s.infoText}>Silenciá notificaciones antes de empezar</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={s.timerContainer}>
              <CircularTimer
                key={timerKey}
                durationMinutes={duracion}
                onComplete={() => {}}
                autoStart
              />
              <TouchableOpacity
                style={s.nuevoBtn}
                onPress={() => { setIniciado(false); setDuracion(5) }}
                activeOpacity={0.8}
              >
                <Text style={[s.nuevoTxt, { color: theme.textoSecundario }]}>← Elegir otra duración</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  )
}

const crearEstilos = (theme: any, esOscuro: boolean) => StyleSheet.create({
  raiz: { flex: 1 },
  fondo: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 16 },
  backBtn: {
    marginBottom: 16, backgroundColor: 'rgba(147,51,234,0.15)', alignSelf: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(147,51,234,0.3)',
  },
  backTxt: { color: theme.primarioClaro, fontSize: 15, fontWeight: '600' },
  titulo: { fontSize: 28, fontWeight: '600', color: theme.textoPrincipal, letterSpacing: 0.5 },
  sub: { fontSize: 14, color: theme.textoClaro, marginTop: 4 },
  contenido: { paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' },
  selectorCard: {
    backgroundColor: theme.tarjeta, borderRadius: 24, padding: 24, width: '100%',
    borderWidth: 1, borderColor: theme.borde,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  selectorTitulo: {
    fontSize: 18, fontWeight: '500', color: theme.textoPrincipal, textAlign: 'center', marginBottom: 20,
  },
  duraGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 10 },
  duraBtn: {
    flex: 1, alignItems: 'center', padding: 16, borderRadius: 18,
    backgroundColor: esOscuro ? 'rgba(255,255,255,0.06)' : 'rgba(147,51,234,0.06)',
    borderWidth: 2, borderColor: 'transparent',
  },
  duraBtnActivo: { borderColor: theme.primario, backgroundColor: esOscuro ? 'rgba(147,51,234,0.2)' : 'rgba(147,51,234,0.12)' },
  duraEmoji: { fontSize: 28, marginBottom: 8 },
  duraLabel: { fontSize: 14, fontWeight: '500', color: theme.textoSecundario },
  duraLabelActivo: { color: theme.primario },
  comenzarBtn: { borderRadius: 18, overflow: 'hidden', elevation: 4, shadowColor: theme.primario, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  comenzarGrad: { paddingVertical: 16, alignItems: 'center' },
  comenzarTexto: { color: '#FFFFFF', fontSize: 18, fontWeight: '500', letterSpacing: 1 },
  infoCard: {
    marginTop: 20, backgroundColor: theme.tarjeta, borderRadius: 20, padding: 20, width: '100%',
    borderWidth: 1, borderColor: theme.borde,
  },
  infoTitulo: { fontSize: 16, fontWeight: '500', color: theme.textoPrincipal, marginBottom: 14 },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoIcon: { fontSize: 18, marginRight: 12 },
  infoText: { fontSize: 14, color: theme.textoSecundario, flex: 1 },
  timerContainer: { alignItems: 'center', marginTop: 20, width: '100%' },
  nuevoBtn: { marginTop: 20, padding: 12 },
  nuevoTxt: { fontSize: 15, fontWeight: '500' },
})

export default TemporizadorScreen
