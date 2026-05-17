import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Vibration,
  Platform,
  Dimensions,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useTheme } from '../context/ThemeContext'

const { width: W } = Dimensions.get('window')
const TAMANO = W * 0.7
const RADIO = TAMANO / 2
const GROSOR = 12

type EstadoTimer = 'idle' | 'running' | 'paused' | 'done'

interface Props {
  durationMinutes: number
  onComplete?: () => void
  autoStart?: boolean
}

const CircularTimer: React.FC<Props> = ({ durationMinutes, onComplete, autoStart = false }) => {
  const { theme } = useTheme()
  const [estado, setEstado] = useState<EstadoTimer>(autoStart ? 'running' : 'idle')
  const [segundosRestantes, setSegundosRestantes] = useState(durationMinutes * 60)
  const [totalSegundos] = useState(durationMinutes * 60)

  const animRotIzq = useRef(new Animated.Value(0)).current
  const animRotDer = useRef(new Animated.Value(0)).current
  const animEscala = useRef(new Animated.Value(1)).current
  const animCompletado = useRef(new Animated.Value(0)).current
  const refInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const progreso = 1 - segundosRestantes / totalSegundos

  useEffect(() => {
    if (estado === 'running' && segundosRestantes > 0) {
      refInterval.current = setInterval(() => {
        setSegundosRestantes(prev => {
          if (prev <= 1) {
            clearInterval(refInterval.current!)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (refInterval.current) clearInterval(refInterval.current)
    }
  }, [estado, segundosRestantes])

  useEffect(() => {
    if (segundosRestantes === 0 && estado === 'running') {
      setEstado('done')
      Vibration.vibrate(500)
      Animated.sequence([
        Animated.timing(animEscala, { toValue: 1.15, duration: 200, useNativeDriver: true }),
        Animated.timing(animEscala, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(animEscala, { toValue: 1.1, duration: 150, useNativeDriver: true }),
        Animated.timing(animEscala, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start()
      Animated.timing(animCompletado, { toValue: 1, duration: 600, useNativeDriver: true }).start()
      onComplete?.()
    }
  }, [segundosRestantes, estado, onComplete, animEscala, animCompletado])

  const rotacionIzq = animRotIzq.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  })
  const rotacionDer = animRotDer.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  })

  const iniciar = useCallback(() => {
    setEstado('running')
    setSegundosRestantes(durationMinutes * 60)
    animRotIzq.setValue(0)
    animRotDer.setValue(0)
    animCompletado.setValue(0)
    Animated.timing(animRotIzq, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()
    Animated.timing(animRotDer, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()
  }, [durationMinutes, animRotIzq, animRotDer, animCompletado])

  const pausar = useCallback(() => {
    setEstado('paused')
  }, [])

  const reanudar = useCallback(() => {
    setEstado('running')
  }, [])

  const detener = useCallback(() => {
    setEstado('idle')
    setSegundosRestantes(durationMinutes * 60)
    animRotIzq.setValue(0)
    animRotDer.setValue(0)
    animCompletado.setValue(0)
    if (refInterval.current) clearInterval(refInterval.current)
  }, [durationMinutes, animRotIzq, animRotDer, animCompletado])

  const formatearTiempo = (s: number): string => {
    const m = Math.floor(s / 60)
    const seg = s % 60
    return `${m}:${seg.toString().padStart(2, '0')}`
  }

  return (
    <View style={estilos.contenedor}>
      <Animated.View style={[estilos.circuloExterior, { transform: [{ scale: animEscala }] }]}>
        <View style={[estilos.mascara, { width: TAMANO, height: TAMANO, borderRadius: RADIO }]}>
          <Animated.View
            style={[
              estilos.semiCirculo,
              estilos.semiIzq,
              {
                width: TAMANO,
                height: TAMANO,
                borderRadius: RADIO,
                transform: [{ rotate: rotacionIzq }],
              },
            ]}
          >
            <View
              style={[
                estilos.semiFill,
                {
                  width: TAMANO / 2,
                  height: TAMANO,
              backgroundColor: theme.primarioClaro,
                  borderTopLeftRadius: RADIO,
                  borderBottomLeftRadius: RADIO,
                  marginLeft: TAMANO / 2,
                },
              ]}
            />
          </Animated.View>
          <Animated.View
            style={[
              estilos.semiCirculo,
              estilos.semiDer,
              {
                width: TAMANO,
                height: TAMANO,
                borderRadius: RADIO,
                transform: [{ rotate: rotacionDer }],
              },
            ]}
          >
            <View
              style={[
                estilos.semiFill,
                {
                  width: TAMANO / 2,
                  height: TAMANO,
                  backgroundColor: theme.primarioClaro,
                  borderTopRightRadius: RADIO,
                  borderBottomRightRadius: RADIO,
                },
              ]}
            />
          </Animated.View>
        </View>

        <View
          style={[
            estilos.centro,
            {
              width: TAMANO - GROSOR * 2,
              height: TAMANO - GROSOR * 2,
              borderRadius: RADIO - GROSOR,
              backgroundColor: theme.fondoCard,
            },
          ]}
        >
          <Text style={[estilos.tiempoTexto, { color: theme.textoPrincipal }]}>
            {formatearTiempo(segundosRestantes)}
          </Text>
          <Text style={[estilos.tiempoLabel, { color: theme.textoSecundario }]}>
            {estado === 'done' ? 'Completado' : estado === 'running' ? 'restante' : estado === 'paused' ? 'pausado' : 'listo'}
          </Text>
        </View>
      </Animated.View>

      <View style={estilos.controles}>
        {(estado === 'idle' || estado === 'done') && (
          <TouchableOpacity style={estilos.btnCircular} onPress={iniciar} activeOpacity={0.8}>
            <LinearGradient colors={[theme.primario, theme.primarioOscuro]} style={estilos.btnGrad}>
              <Text style={estilos.btnTexto}>▶ Iniciar</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        {estado === 'running' && (
          <TouchableOpacity style={estilos.btnCircular} onPress={pausar} activeOpacity={0.8}>
            <LinearGradient colors={[theme.primario, theme.primarioOscuro]} style={estilos.btnGrad}>
              <Text style={estilos.btnTexto}>⏸ Pausar</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        {estado === 'paused' && (
          <>
            <TouchableOpacity style={estilos.btnCircular} onPress={reanudar} activeOpacity={0.8}>
              <LinearGradient colors={[theme.primario, theme.primarioOscuro]} style={estilos.btnGrad}>
                <Text style={estilos.btnTexto}>▶ Reanudar</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={estilos.btnSecundario} onPress={detener} activeOpacity={0.8}>
              <Text style={[estilos.btnSecTexto, { color: theme.textoSecundario }]}>⏹ Detener</Text>
            </TouchableOpacity>
          </>
        )}
        {estado === 'running' && (
          <TouchableOpacity style={estilos.btnSecundario} onPress={detener} activeOpacity={0.8}>
            <Text style={[estilos.btnSecTexto, { color: theme.textoSecundario }]}>⏹ Detener</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloExterior: {
    width: TAMANO,
    height: TAMANO,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  mascara: {
    position: 'absolute',
    overflow: 'hidden',
  },
  semiCirculo: {
    position: 'absolute',
    overflow: 'hidden',
  },
  semiIzq: {},
  semiDer: {
    left: 0,
    top: 0,
  },
  semiFill: {},
  centro: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(147,51,234,0.2)',
    elevation: 6,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  tiempoTexto: {
    fontSize: 40,
    fontWeight: '300',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
    letterSpacing: 2,
  },
  tiempoLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  controles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btnCircular: {
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnGrad: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    alignItems: 'center',
    minWidth: 140,
  },
  btnTexto: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  btnSecundario: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    minWidth: 100,
    alignItems: 'center',
  },
  btnSecTexto: {
    fontSize: 15,
    fontWeight: '500',
  },
})

export default CircularTimer
