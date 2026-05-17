// ============================================================
// NavegadorApp.tsx — Navegador principal de Modo Zen
// Maneja el flujo de autenticación y las rutas de la app.
// Si el usuario está logueado → pantalla principal.
// Si no → pantallas de login/registro.
// ============================================================

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import type { NavigationState } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Contexto de autenticación (provee estado del usuario)
import { useAuth } from '../context/AuthContext';
// Pantallas de la aplicación
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import MeditationSessionScreen from '../screens/MeditationSessionScreen';
import SonidosScreen from '../screens/SonidosScreen';
import ProgresoScreen from '../screens/ProgresoScreen';
import AjustesScreen from '../screens/AjustesScreen';
import HistoriasScreen from '../screens/HistoriasScreen';
import CaminatasScreen from '../screens/CaminatasScreen';
import BiofeedbackScreen from '../screens/BiofeedbackScreen';
import VideosRelajantesScreen from '../screens/VideosRelajantesScreen';
import ReflexionScreen from '../screens/ReflexionScreen';
import TemporizadorScreen from '../screens/TemporizadorScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import RespiracionScreen from '../screens/RespiracionScreen';
import MiniMusicPlayer from '../components/MiniMusicPlayer';
// Colores del tema
import { colors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

/** Tipos de las rutas del stack de navegación */
export type ListaPantallas = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Home: { fromMeditation?: boolean } | undefined;
  MeditationSession: { sessionId: string };
  Sonidos: undefined;
  Progreso: undefined;
  Ajustes: undefined;
  Historias: undefined;
  VideosRelajantes: undefined;
  Reflexion: undefined;
  Caminatas: undefined;
  Biofeedback: undefined;
  Temporizador: undefined;
  Respiracion: undefined;
};

// Creamos el stack de navegación con los tipos definidos
const Stack = createNativeStackNavigator<ListaPantallas>();

/** Pantallas donde el mini-player NO se muestra */
const PANTALLAS_SIN_PLAYER = ['Home', 'VideosRelajantes', 'MeditationSession', 'Login', 'Register', 'Sonidos', 'Reflexion', 'Onboarding', 'Respiracion'];

/** Extrae el nombre de la ruta activa de un NavigationState */
const getActiveRouteName = (state?: NavigationState): string => {
  if (!state || !state.routes || state.routes.length === 0) return '';
  return state.routes[state.index]?.name ?? '';
};

/**
 * NavegadorApp — Componente raíz de navegación.
 * Muestra un indicador de carga mientras verifica la sesión,
 * luego renderiza las pantallas según el estado de autenticación.
 */
const AppNavigator: React.FC = () => {
  const { cargando, estaLogueado } = useAuth();
  const { theme } = useTheme();
  const [rutaActual, setRutaActual] = useState('');
  const [onboardingCompleto, setOnboardingCompleto] = useState(false);
  const [verificandoOnboarding, setVerificandoOnboarding] = useState(true);

  useEffect(() => {
    const verificar = async () => {
      try {
        const completo = await AsyncStorage.getItem('@ModoZen:onboardingComplete');
        setOnboardingCompleto(completo === 'true');
      } catch {}
      setVerificandoOnboarding(false);
    };
    verificar();
  }, []);

  const onStateChange = useCallback((state?: NavigationState) => {
    setRutaActual(getActiveRouteName(state));
  }, []);

  const mostrarPlayer = estaLogueado && !PANTALLAS_SIN_PLAYER.includes(rutaActual);

  if (cargando || verificandoOnboarding) {
    return (
      <View style={estilos.contenedorCarga}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const pantallaInicial = estaLogueado && !onboardingCompleto ? 'Onboarding' : 'Home';

  return (
    <NavigationContainer onStateChange={onStateChange}>
      <View style={{ flex: 1 }}>
        <Stack.Navigator
          initialRouteName={pantallaInicial}
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.fondo },
            animation: 'fade_from_bottom',
            animationDuration: 350,
          }}
        >
          {estaLogueado ? (
            /* --- Pantallas para usuarios autenticados --- */
            <>
              <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: 'fade' }} />
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen
                name="MeditationSession"
                component={MeditationSessionScreen}
                options={{
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen name="Sonidos" component={SonidosScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="Progreso" component={ProgresoScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="Ajustes" component={AjustesScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="Historias" component={HistoriasScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="VideosRelajantes" component={VideosRelajantesScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="Reflexion" component={ReflexionScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="Caminatas" component={CaminatasScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="Biofeedback" component={BiofeedbackScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="Temporizador" component={TemporizadorScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="Respiracion" component={RespiracionScreen} options={{ animation: 'slide_from_right' }} />
            </>
          ) : (
            /* --- Pantallas de autenticación --- */
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{
                  animation: 'slide_from_right',
                }}
              />
            </>
          )}
        </Stack.Navigator>
        {mostrarPlayer && <MiniMusicPlayer />}
      </View>
    </NavigationContainer>
  );
};

// ============================================================
// Estilos del navegador
// ============================================================
const estilos = StyleSheet.create({
  /** Contenedor que se muestra mientras carga la sesión */
  contenedorCarga: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F23',
  },
});

export default AppNavigator;
