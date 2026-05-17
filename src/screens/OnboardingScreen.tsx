import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ListaPantallas } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<ListaPantallas, 'Onboarding'>;
interface Props { navigation: Nav; }

interface PasoOnboarding {
  icono: string;
  titulo_es: string;
  titulo_en: string;
  desc_es: string;
  desc_en: string;
  gradiente: [string, string];
}

const PASOS: PasoOnboarding[] = [
  {
    icono: '🧘',
    titulo_es: 'Bienvenido a Modo Zen',
    titulo_en: 'Welcome to Modo Zen',
    desc_es: 'Tu espacio personal para meditar, relajarte y encontrar la calma interior.',
    desc_en: 'Your personal space to meditate, relax, and find inner calm.',
    gradiente: ['#9333EA', '#7C3AED'],
  },
  {
    icono: '🎯',
    titulo_es: 'Meditaciones Guiadas',
    titulo_en: 'Guided Meditations',
    desc_es: 'Sesiones paso a paso para todos los niveles. Desde 3 hasta 15 minutos.',
    desc_en: 'Step-by-step sessions for all levels. From 3 to 15 minutes.',
    gradiente: ['#06B6D4', '#0891B2'],
  },
  {
    icono: '🔥',
    titulo_es: 'Construye tu Racha',
    titulo_en: 'Build Your Streak',
    desc_es: 'Medita cada día y observa tu progreso. La constancia es la clave.',
    desc_en: 'Meditate every day and watch your progress. Consistency is key.',
    gradiente: ['#F97316', '#EA580C'],
  },
  {
    icono: '🔒',
    titulo_es: 'Tu Privacidad Primero',
    titulo_en: 'Your Privacy First',
    desc_es: 'Tus datos se guardan localmente. Sin cuentas obligatorias, sin rastreo.',
    desc_en: 'Your data is stored locally. No mandatory accounts, no tracking.',
    gradiente: ['#10B981', '#059669'],
  },
];

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [pasoActual, setPasoActual] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const pasosRef = useRef<PasoOnboarding[]>(PASOS);

  const paso = pasosRef.current[pasoActual];
  const esUltimo = pasoActual === PASOS.length - 1;

  const avanzar = () => {
    if (esUltimo) {
      completarOnboarding(navigation);
    } else {
      setPasoActual(prev => prev + 1);
    }
  };

  const saltar = () => {
    completarOnboarding(navigation);
  };

  const completarOnboarding = async (nav: Nav) => {
    try {
      await AsyncStorage.setItem('@ModoZen:onboardingComplete', 'true');
    } catch {}
    nav.replace('Home');
  };

  return (
    <View style={s.raiz}>
      <LinearGradient colors={['#0F0F23', '#1A1A2E', '#16213E']} style={s.fondo}>
        {/* Botón saltar */}
        {!esUltimo && (
          <TouchableOpacity style={s.saltarBtn} onPress={saltar} activeOpacity={0.7}>
            <Text style={s.saltarTxt}>Saltar</Text>
          </TouchableOpacity>
        )}

        {/* Contenido del paso */}
        <View style={s.contenido}>
          <View style={[s.iconoWrap, { backgroundColor: `${paso.gradiente[0]}22` }]}>
            <Text style={s.icono}>{paso.icono}</Text>
          </View>

          <Text style={s.titulo}>
            {pasoActual === 0 ? paso.titulo_es : paso.titulo_en}
          </Text>
          <Text style={s.descripcion}>
            {pasoActual === 0 ? paso.desc_es : paso.desc_en}
          </Text>
        </View>

        {/* Indicadores */}
        <View style={s.indicadores}>
          {PASOS.map((_, i) => (
            <View
              key={i}
              style={[
                s.indicador,
                i === pasoActual && s.indicadorActivo,
              ]}
            />
          ))}
        </View>

        {/* Botón continuar */}
        <TouchableOpacity style={s.btnContinuar} onPress={avanzar} activeOpacity={0.85}>
          <LinearGradient colors={paso.gradiente} style={s.btnGrad}>
            <Text style={s.btnTxt}>
              {esUltimo ? 'Comenzar' : 'Continuar'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const s = StyleSheet.create({
  raiz: { flex: 1 },
  fondo: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  saltarBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    padding: 10,
  },
  saltarTxt: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir',
  },
  contenido: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconoWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  icono: { fontSize: 64 },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  descripcion: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
  },
  indicadores: {
    flexDirection: 'row',
    marginBottom: 40,
    gap: 8,
  },
  indicador: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  indicadorActivo: {
    width: 24,
    backgroundColor: '#9333EA',
  },
  btnContinuar: {
    width: '80%',
    marginBottom: 60,
    borderRadius: 18,
    overflow: 'hidden',
  },
  btnGrad: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnTxt: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
});

export default OnboardingScreen;
