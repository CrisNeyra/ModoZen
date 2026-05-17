import React, { useEffect, useRef, useMemo } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Platform,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useTheme } from '../context/ThemeContext'

interface Props {
  sesionesPorDia: Record<string, number>
}

const ETIQUETAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const Dashboard: React.FC<Props> = ({ sesionesPorDia }) => {
  const { theme } = useTheme()
  const animBarras = useRef([0, 1, 2, 3, 4, 5, 6].map(() => new Animated.Value(0))).current

  useEffect(() => {
    Animated.stagger(80,
      animBarras.map(a => Animated.spring(a, { toValue: 1, tension: 40, friction: 6, useNativeDriver: false }))
    ).start()
  }, [animBarras])

  const minutosSemanales = useMemo(() => {
    const hoy = new Date()
    const diaSemana = hoy.getDay()
    const lunes = new Date(hoy)
    lunes.setDate(hoy.getDate() - ((diaSemana + 6) % 7))
    const resultado: number[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(lunes)
      d.setDate(lunes.getDate() + i)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      resultado.push(sesionesPorDia[key] || 0)
    }
    return resultado
  }, [sesionesPorDia])

  const maxMinSemana = Math.max(...minutosSemanales, 1)
  const totalMinSemana = minutosSemanales.reduce((a, b) => a + b, 0)
  const totalSesionesSemana = Object.values(sesionesPorDia).filter(m => m > 0).length

  const s = crearEstilos(theme)

  return (
    <View style={s.contenedor}>
      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={s.statValor}>{totalMinSemana}</Text>
          <Text style={s.statLabel}>min esta semana</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statValor}>{totalSesionesSemana}</Text>
          <Text style={s.statLabel}>días con sesión</Text>
        </View>
      </View>

      <View style={s.barrasCard}>
        <Text style={s.titulo}>Minutos por día</Text>
        <View style={s.barrasContainer}>
          {minutosSemanales.map((minutos, idx) => (
            <View key={idx} style={s.diaCol}>
              <Text style={s.minLabel}>{minutos}</Text>
              <View style={s.barWrapper}>
                <Animated.View
                  style={[
                    s.barra,
                    {
                      height: animBarras[idx].interpolate({
                        inputRange: [0, 1],
                        outputRange: [4, Math.max(4, (minutos / maxMinSemana) * 80)],
                      }),
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[theme.primario, theme.primarioClaro]}
                    style={s.barraGrad}
                  />
                </Animated.View>
              </View>
              <Text style={s.diaLabel}>{ETIQUETAS[idx]}</Text>
            </View>
          ))}
        </View>

        {/* Leyenda */}
        <View style={s.leyenda}>
          <View style={[s.leyendaDot, { backgroundColor: theme.primario }]} />
          <Text style={s.leyendaTxt}>Minutos de meditación</Text>
        </View>
      </View>
    </View>
  )
}

const crearEstilos = (theme: any) => StyleSheet.create({
  contenedor: {
    marginTop: 24,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.tarjeta,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.borde,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.borde,
  },
  statValor: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.primario,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  statLabel: {
    fontSize: 11,
    color: theme.textoClaro,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  barrasCard: {
    backgroundColor: theme.tarjeta,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.borde,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textoPrincipal,
    marginBottom: 20,
  },
  barrasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 110,
  },
  diaCol: {
    flex: 1,
    alignItems: 'center',
  },
  minLabel: {
    fontSize: 10,
    color: theme.textoClaro,
    marginBottom: 4,
    fontWeight: '500',
  },
  barWrapper: {
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barra: {
    width: 12,
    borderRadius: 6,
    overflow: 'hidden',
    minHeight: 4,
  },
  barraGrad: {
    flex: 1,
    borderRadius: 6,
  },
  diaLabel: {
    fontSize: 11,
    color: theme.textoSecundario,
    marginTop: 8,
    fontWeight: '600',
  },
  leyenda: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 6,
  },
  leyendaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  leyendaTxt: {
    fontSize: 11,
    color: theme.textoClaro,
  },
})

export default Dashboard
