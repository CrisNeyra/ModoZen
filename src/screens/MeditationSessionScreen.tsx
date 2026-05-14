// ============================================================
// PantallaSesionMeditacion.tsx - Sesion completa de meditacion
// Flujo de 5 fases: vista previa, animo previo, sesion activa,
// animo posterior y resumen final.
// Incluye animacion de respiracion, vibracion, diario personal,
// calificacion, estadisticas y sonidos ambientales.
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  TextInput,
  Image,
} from 'react-native';
import Video, { ViewType } from 'react-native-video'; // Video de fondo decorativo
import AsyncStorage from '@react-native-async-storage/async-storage'; // Persistencia local
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import type { ListaPantallas } from '../navigation/AppNavigator';
import { useStats } from '../context/StatsContext';
import { useRatingPrompt } from '../context/RatingPromptContext';
import MiniMusicPlayer from '../components/MiniMusicPlayer';

// Dimensiones de pantalla
const { width: anchoPantalla, height: altoPantalla } = Dimensions.get('window');

type NavegacionSesion = NativeStackNavigationProp<ListaPantallas, 'MeditationSession'>;
type RutaSesion = RouteProp<ListaPantallas, 'MeditationSession'>;

const CLAVE_ESTADISTICAS = '@modozen/estadisticas-meditacion';
const videoFondoPredeterminado = require('../assets/background.mp4');

/** Fondo por sesión: mp4 en `assets/videos/sesion-*`; la 6 es imagen (`sesion-6.jpg`). */
type FondoSesion = { tipo: 'video'; source: any } | { tipo: 'imagen'; source: any };

const FONDOS_SESION: Record<string, FondoSesion> = {
  '1': { tipo: 'video', source: require('../assets/videos/sesion-1.mp4') },
  '2': { tipo: 'video', source: require('../assets/videos/sesion-2.mp4') },
  '3': { tipo: 'video', source: require('../assets/videos/sesion-3.mp4') },
  '4': { tipo: 'video', source: require('../assets/videos/sesion-4.mp4') },
  '5': { tipo: 'video', source: require('../assets/videos/sesion-5.mp4') },
  '6': { tipo: 'imagen', source: require('../assets/videos/sesion-6.jpg') },
};

const ESTADOS_ANIMO = [
  { id: 'peaceful', icon: '😌', label: 'En paz' },
  { id: 'happy', icon: '🙂', label: 'Bien' },
  { id: 'neutral', icon: '😐', label: 'Neutral' },
  { id: 'anxious', icon: '😟', label: 'Ansioso/a' },
  { id: 'sad', icon: '😔', label: 'Triste' },
  { id: 'stressed', icon: '😣', label: 'Estresado/a' },
];

interface Props {
  navigation: NavegacionSesion;
  route: RutaSesion;
}

interface PasoMeditacion {
  title: string;
  instruction: string;
  duration: number;
  breathPattern?: { inhale: number; hold: number; exhale: number };
  icon: string;
}

interface DatosSesion {
  id: string;
  title: string;
  icon: string;
  totalDuration: string;
  description: string;
  benefits: string[];
  steps: PasoMeditacion[];
}

const datosSesiones: Record<string, DatosSesion> = {
    '1': {
      id: '1',
      title: 'Respiración Profunda',
      icon: '🌬️',
      totalDuration: '5 min',
      description: 'Técnica de respiración 4-7-8 para calmar el sistema nervioso y reducir la ansiedad de forma inmediata.',
      benefits: [
        'Reduce la ansiedad y el estrés',
        'Baja la presión arterial',
        'Mejora la concentración',
        'Promueve el sueño reparador',
      ],
      steps: [
        {
          title: 'Preparación',
          instruction: 'Sentáte cómodamente con la espalda recta. Colocá una mano en el pecho y otra en el abdomen. Cerrá los ojos y tomá conciencia de tu respiración natural.',
          duration: 45,
          icon: '🪷',
        },
        {
          title: 'Respiración 4-7-8',
          instruction: 'INHALÁ por la nariz contando hasta 4. MANTENÉ el aire contando hasta 7. EXHALÁ lentamente por la boca contando hasta 8. Repetí el ciclo.',
          duration: 90,
          breathPattern: { inhale: 4, hold: 7, exhale: 8 },
          icon: '🫁',
        },
        {
          title: 'Ola de Calma',
          instruction: 'Imaginá que cada respiración es una ola del mar. La inhalación trae agua tibia y la exhalación la lleva, arrastrando toda tensión con ella.',
          duration: 90,
          breathPattern: { inhale: 5, hold: 3, exhale: 7 },
          icon: '🌊',
        },
        {
          title: 'Cierre',
          instruction: 'Dejá que tu respiración vuelva a su ritmo natural. Mové suavemente los dedos de las manos y los pies. Cuando estés listo, abrí los ojos lentamente.',
          duration: 45,
          icon: '✨',
        },
      ],
    },
    '2': {
      id: '2',
      title: 'Calma Matutina',
      icon: '☀️',
      totalDuration: '5 min',
      description: 'Meditación guiada para comenzar el día con intención, claridad y energía positiva. Ideal para practicar al despertar.',
      benefits: [
        'Establece una intención positiva para el día',
        'Aumenta la energía y vitalidad',
        'Mejora el estado de ánimo',
        'Potencia la productividad',
      ],
      steps: [
        {
          title: 'Despertar Consciente',
          instruction: 'Tomá conciencia de tu cuerpo. Sentí el peso sobre la superficie que te sostiene. Estirá los brazos suavemente y pensá en 3 cosas por las que estás agradecido/a.',
          duration: 60,
          icon: '🌅',
        },
        {
          title: 'Respiración Energizante',
          instruction: 'Inhalá profundamente por la nariz en 4 tiempos. Exhalá con fuerza por la boca en 4 tiempos. Sentí cómo la energía fluye por tu cuerpo.',
          duration: 90,
          breathPattern: { inhale: 4, hold: 2, exhale: 4 },
          icon: '💨',
        },
        {
          title: 'Intención y Visualización',
          instruction: 'Definí tu intención para hoy. Puede ser: "Hoy elijo la calma" o "Hoy me cuido". Visualizate completando tu día con éxito y sonreí.',
          duration: 120,
          icon: '🎯',
        },
        {
          title: 'Activación',
          instruction: 'Estirá suavemente los brazos sobre tu cabeza. Mové el cuerpo con suavidad. Abrí los ojos y mantené la sonrisa. ¿Estás listo/a para un gran día?',
          duration: 30,
          icon: '🙌',
        },
      ],
    },
    '3': {
      id: '3',
      title: 'Relajación Nocturna',
      icon: '🌙',
      totalDuration: '6 min',
      description: 'Meditación profunda para soltar las tensiones del día y preparar tu cuerpo y mente para un sueño reparador.',
      benefits: [
        'Mejora la calidad del sueño',
        'Libera las tensiones acumuladas',
        'Calma la mente hiperactiva',
        'Reduce el insomnio',
      ],
      steps: [
        {
          title: 'Acomodación',
          instruction: 'Acostate boca arriba en una posición cómoda. Brazos relajados a los lados, palmas hacia arriba. Cerrá los ojos y tomá 3 respiraciones profundas.',
          duration: 60,
          icon: '🛏️',
        },
        {
          title: 'Soltar el Día',
          instruction: 'Revisá mentalmente tu día sin juzgar. Cada evento que recuerdes, imaginá que lo ponés en una caja y la cerrás. El día terminó, es momento de descansar.',
          duration: 90,
          icon: '📦',
        },
        {
          title: 'Relajación Muscular',
          instruction: 'Tensá los pies 5 segundos y soltá. Luego piernas, abdomen, hombros y mandíbula. Con cada grupo, sentí cómo la tensión se disuelve completamente.',
          duration: 120,
          breathPattern: { inhale: 4, hold: 4, exhale: 8 },
          icon: '😴',
        },
        {
          title: 'Silencio y Sueño',
          instruction: 'Imaginá un cielo estrellado. Cada estrella es un momento bonito. Contá lentamente del 10 al 1, descendé hacia un sueño profundo y reparador...',
          duration: 90,
          icon: '🌌',
        },
      ],
    },
    '4': {
      id: '4',
      title: 'Naturaleza',
      icon: '🌿',
      totalDuration: '6 min',
      description: 'Meditación de conexión con la naturaleza. Un viaje interior para reconectar con la tierra y renovar tu energía vital.',
      benefits: [
        'Reconexión con la naturaleza interior',
        'Equilibrio emocional',
        'Reducción del agotamiento mental',
        'Sensación de pertenencia y paz',
      ],
      steps: [
        {
          title: 'Enraizamiento',
          instruction: 'Sentate con los pies apoyados en el suelo. Imaginá raíces que crecen desde tus pies hacia la tierra. Sentí la conexión firme con el suelo.',
          duration: 60,
          icon: '🌱',
        },
        {
          title: 'Viaje por el Bosque',
          instruction: 'Imaginá un bosque frondoso. Escuchá los pájaros, el viento entre las hojas, un arroyo lejano. Inhalá el aroma fresco de los árboles.',
          duration: 120,
          icon: '🌲',
        },
        {
          title: 'Los Cuatro Elementos',
          instruction: 'Sentí el agua como emociones fluyendo, el fuego como pasión en tu pecho, el aire limpiando tu mente y la tierra sosteniéndote. Sos completo/a.',
          duration: 120,
          breathPattern: { inhale: 5, hold: 3, exhale: 5 },
          icon: '🌎',
        },
        {
          title: 'Regreso',
          instruction: 'Lentamente, regresá al aquí y ahora. Llevá con vos la calma del bosque y la fuerza de la tierra. Abrí los ojos con gratitud.',
          duration: 60,
          icon: '🍂',
        },
      ],
    },
    '5': {
      id: '5',
      title: 'Reducir Estrés',
      icon: '🧘',
      totalDuration: '5 min',
      description: 'Técnicas probadas de mindfulness para reducir el estrés, liberar tensión acumulada y recuperar la claridad mental.',
      benefits: [
        'Reducción inmediata del cortisol',
        'Liberación de tensión muscular',
        'Claridad mental renovada',
        'Mayor resiliencia emocional',
      ],
      steps: [
        {
          title: 'STOP y Respiración Box',
          instruction: 'Detente. Inhalá contando hasta 4. Retené contando hasta 4. Exhalá contando hasta 4. Retené vacío contando hasta 4. Repetí el ciclo.',
          duration: 90,
          breathPattern: { inhale: 4, hold: 4, exhale: 4 },
          icon: '🟦',
        },
        {
          title: 'Identificar y Liberar',
          instruction: '¿Dónde sentís el estrés? ¿Hombros, mandíbula, estómago? Dirigí tu respiración hacia ese punto. Cada exhalación disuelve la tensión como hielo al sol.',
          duration: 90,
          icon: '💆',
        },
        {
          title: 'Anclaje al Presente',
          instruction: 'Nombrá 5 cosas que ves, 4 que tocás, 3 que oís, 2 que olés, 1 que saboreás. Esta técnica 5-4-3-2-1 te ancla al momento presente.',
          duration: 90,
          icon: '⚓',
        },
        {
          title: 'Cierre',
          instruction: 'Repetí: "Esto también va a pasar. Soy capaz. Estoy a salvo." Esbozá una sonrisa. Comprometete a volver a esta práctica cuando lo necesites.',
          duration: 30,
          icon: '🤍',
        },
      ],
    },
    '6': {
      id: '6',
      title: 'Enfoque Mental',
      icon: '🎯',
      totalDuration: '5 min',
      description: 'Meditación de concentración para mejorar tu enfoque, memoria y productividad en pocos minutos.',
      benefits: [
        'Mayor capacidad de concentración',
        'Reducción de distracciones mentales',
        'Mejora de la memoria de trabajo',
        'Aumento de la productividad',
      ],
      steps: [
        {
          title: 'Postura y Limpieza Mental',
          instruction: 'Sentate erguido/a, hombros atrás. Imaginá una pizarra con todos tus pensamientos. Con un borrador, limpiala completamente. Tu mente está en blanco.',
          duration: 60,
          icon: '🧠',
        },
        {
          title: 'Punto de Enfoque',
          instruction: 'Con los ojos cerrados, concentrá toda tu atención en el punto entre tus cejas. Si tu mente divaga, regresá amablemente a ese punto.',
          duration: 90,
          breathPattern: { inhale: 4, hold: 4, exhale: 4 },
          icon: '👁️',
        },
        {
          title: 'Visualización del Objetivo',
          instruction: 'Pensá en tu tarea más importante de hoy. Visualizate completándola con éxito. Sentí la satisfacción del logro. Tu cerebro ya se está preparando.',
          duration: 90,
          icon: '📌',
        },
        {
          title: 'Activación Final',
          instruction: 'Tomá 3 respiraciones profundas y enérgicas. Repetí: "Estoy enfocado/a, soy capaz, estoy listo/a." Abrí los ojos con determinación.',
          duration: 30,
          icon: '🚀',
        },
      ],
    },
  };

// ============================================================
// Componente principal: PantallaSesionMeditacion
// ============================================================
const MeditationSessionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { sessionId: idSesion } = route.params;
  const sesion = datosSesiones[idSesion];
  const fondoSesion: FondoSesion = FONDOS_SESION[idSesion] ?? { tipo: 'video', source: videoFondoPredeterminado };
  const { registrarSesion } = useStats();
  const { trackInteraction } = useRatingPrompt();

  // Fase actual del flujo: 'preview' | 'mood-before' | 'active' | 'mood-after' | 'completed'
  const [fase, setFase] = useState<string>('preview');
  const [indicePasoActual, setIndicePasoActual] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [estaPausado, setEstaPausado] = useState(false);
  const [faseRespiracion, setFaseRespiracion] = useState<'inhale' | 'hold' | 'exhale' | null>(null);
  const [conteoRespiracion, setConteoRespiracion] = useState(0);
  
  // Estado de funciones premium
  const [animoAntes, setAnimoAntes] = useState<string | null>(null);
  const [animoDespues, setAnimoDespues] = useState<string | null>(null);
  const [calificacion, setCalificacion] = useState(0);
  const [notaDiario, setNotaDiario] = useState('');
  const [tiempoTotalTranscurrido, setTiempoTotalTranscurrido] = useState(0);
  const [pasosCompletados, setPasosCompletados] = useState(0);
  const [esFavorito, setEsFavorito] = useState(false);
  const [mostrarConsejo, setMostrarConsejo] = useState(true);
  
  // Referencias para animaciones y timers
  const animOpacidad = useRef(new Animated.Value(0)).current;
  const animEscala = useRef(new Animated.Value(1)).current;
  const animRespiracion = useRef(new Animated.Value(1)).current;
  const animBrillo = useRef(new Animated.Value(0.3)).current;
  const refTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const refTimerRespiracion = useRef<ReturnType<typeof setInterval> | null>(null);
  const refTiempoTranscurrido = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animacion de entrada y brillo pulsante al montar el componente
  useEffect(() => {
    Animated.timing(animOpacidad, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    // Animacion de brillo pulsante (loop infinito)
    Animated.loop(
      Animated.sequence([
        Animated.timing(animBrillo, { toValue: 0.8, duration: 2000, useNativeDriver: true }),
        Animated.timing(animBrillo, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer principal: cuenta regresiva de cada paso
  useEffect(() => {
    if (fase === 'active' && !estaPausado && tiempoRestante > 0) {
      refTimer.current = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) {
            manejarPasoCompleto();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (refTimer.current) clearInterval(refTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, estaPausado, tiempoRestante, indicePasoActual]);

  // Contador de tiempo total transcurrido
  useEffect(() => {
    if (fase === 'active' && !estaPausado) {
      refTiempoTranscurrido.current = setInterval(() => {
        setTiempoTotalTranscurrido(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (refTiempoTranscurrido.current) clearInterval(refTiempoTranscurrido.current);
    };
  }, [fase, estaPausado]);

  // Animacion de respiracion: circulo que se expande o contrae segun el patron
  useEffect(() => {
    const paso = sesion?.steps[indicePasoActual];
    if (!paso?.breathPattern || fase !== 'active' || estaPausado) {
      if (refTimerRespiracion.current) clearInterval(refTimerRespiracion.current);
      return;
    }

    const { inhale, hold, exhale } = paso.breathPattern;
    const cicloTotal = (inhale + hold + exhale) * 1000;
    
    // Ejecuta un ciclo completo de respiracion
    const ejecutarCicloRespiracion = () => {
      setFaseRespiracion('inhale');
      setConteoRespiracion(inhale);
      Animated.timing(animRespiracion, {
        toValue: 1.4,
        duration: inhale * 1000,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        setFaseRespiracion('hold');
        setConteoRespiracion(hold);
      }, inhale * 1000);

      setTimeout(() => {
        setFaseRespiracion('exhale');
        setConteoRespiracion(exhale);
        Animated.timing(animRespiracion, {
          toValue: 1,
          duration: exhale * 1000,
          useNativeDriver: true,
        }).start();
      }, (inhale + hold) * 1000);
    };

    ejecutarCicloRespiracion();
    refTimerRespiracion.current = setInterval(ejecutarCicloRespiracion, cicloTotal);

    return () => {
      if (refTimerRespiracion.current) clearInterval(refTimerRespiracion.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indicePasoActual, fase, estaPausado]);

  /** Guarda las estadisticas de la sesion via StatsContext */
  const guardarEstadisticas = async () => {
    await registrarSesion({
      sessionId: idSesion,
      durationSeconds: tiempoTotalTranscurrido,
      moodBefore: animoAntes,
      moodAfter: animoDespues,
      rating: calificacion,
      note: notaDiario,
    });
  };

  /** Maneja la finalizacion de un paso de meditacion */
  const manejarPasoCompleto = () => {
    if (refTimer.current) clearInterval(refTimer.current);
    setPasosCompletados(prev => prev + 1);
    
    if (indicePasoActual < (sesion?.steps.length || 0) - 1) {
      // Avanzar al siguiente paso
      const siguienteIndice = indicePasoActual + 1;
      setIndicePasoActual(siguienteIndice);
      setTiempoRestante(sesion.steps[siguienteIndice].duration);
      
      // Animacion de transicion
      Animated.sequence([
        Animated.timing(animEscala, { toValue: 0.95, duration: 150, useNativeDriver: true }),
        Animated.timing(animEscala, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    } else {
      // Sesion completada: ir al seguimiento de animo
      setFase('mood-after');
    }
  };

  /** Inicia la fase de estado de animo previo */
  const iniciarSeguimientoAnimo = () => {
    setFase('mood-before');
  };

  /** Inicia la sesion activa de meditacion */
  const iniciarSesion = () => {
    setIndicePasoActual(0);
    setTiempoRestante(sesion.steps[0].duration);
    setFase('active');
    setEstaPausado(false);
    setTiempoTotalTranscurrido(0);
    setPasosCompletados(0);
  };

  /** Alterna pausa o reanudacion de la sesion */
  const alternarPausa = () => {
    setEstaPausado(!estaPausado);
  };

  /** Detiene la sesion y vuelve a la vista previa */
  const detenerSesion = () => {
    setFase('preview');
    setEstaPausado(false);
    setIndicePasoActual(0);
    setTiempoRestante(0);
    if (refTimer.current) clearInterval(refTimer.current);
    if (refTimerRespiracion.current) clearInterval(refTimerRespiracion.current);
    if (refTiempoTranscurrido.current) clearInterval(refTiempoTranscurrido.current);
  };

  /** Completa la sesion y muestra el resumen */
  const completarSesion = async () => {
    await guardarEstadisticas();
    await trackInteraction('meditation_completed');
    setFase('completed');
  };

  /** Formatea segundos a formato mm:ss */
  const formatearTiempo = (segundos: number): string => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins}:${segs.toString().padStart(2, '0')}`;
  };

  // Paso actual de meditacion (solo en fase activa)
  const pasoActual = fase === 'active' ? sesion.steps[indicePasoActual] : null;
  // Progreso como porcentaje
  const progreso = fase === 'active' ? (indicePasoActual + 1) / sesion.steps.length : 0;

  /** Calcula el nivel de dificultad segun la cantidad de pasos */
  const obtenerDificultad = () => {
    const cantidadPasos = sesion.steps.length;
    if (cantidadPasos <= 6) return { etiqueta: 'Principiante', color: '#4CAF50', puntos: 1 };
    if (cantidadPasos <= 8) return { etiqueta: 'Intermedio', color: '#F5C842', puntos: 2 };
    return { etiqueta: 'Avanzado', color: '#9333EA', puntos: 3 };
  };
  const dificultad = sesion ? obtenerDificultad() : { etiqueta: '', color: '#4CAF50', puntos: 0 };

  // Guard: si no existe la sesion, mostrar pantalla de error
  if (!sesion) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1A1A2E', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#FFF', fontSize: 18, marginBottom: 16 }}>Sesión no encontrada</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ backgroundColor: '#9333EA', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 }}>
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={estilos.mainContainer}>
      {/* Fondo: vídeo o imagen según sesión (sesion-1 … sesion-6 en assets/videos) */}
      {fondoSesion.tipo === 'imagen' ? (
        <Image
          source={fondoSesion.source}
          style={estilos.backgroundVideo}
          resizeMode="cover"
        />
      ) : (
        <Video
          source={fondoSesion.source}
          style={estilos.backgroundVideo}
          resizeMode="cover"
          repeat
          muted
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          mixWithOthers="mix"
          rate={1.0}
          paused={false}
          maxBitRate={500000}
          bufferConfig={{
            minBufferMs: 5000,
            maxBufferMs: 15000,
            bufferForPlaybackMs: 1000,
            bufferForPlaybackAfterRebufferMs: 2000,
          }}
          disableFocus
          {...(Platform.OS === 'android' ? { viewType: ViewType.TEXTURE } : {})}
        />
      )}

      {/* Overlay oscuro semi-transparente con gradiente */}
      <LinearGradient
        colors={['rgba(15,15,35,0.5)', 'rgba(88,28,135,0.3)', 'rgba(15,15,35,0.6)']}
        style={estilos.videoOverlay}
      />

      <ScrollView style={estilos.container} showsVerticalScrollIndicator={false}>
        <Animated.View style={[estilos.content, { opacity: animOpacidad }]}>
          {/* Encabezado: boton volver, titulo, favorito */}
          <View style={estilos.header}>
            <TouchableOpacity style={estilos.backBtn} onPress={() => navigation.goBack()}>
              <Text style={estilos.backBtnText}>← Volver</Text>
            </TouchableOpacity>
            <Text style={estilos.headerTitle}>{sesion.icon} {sesion.title}</Text>
            <TouchableOpacity onPress={() => setEsFavorito(!esFavorito)} style={estilos.favBtn}>
              <Text style={estilos.favIcon}>{esFavorito ? '💜' : '🤍'}</Text>
            </TouchableOpacity>
          </View>

          {/* ===== FASE: Vista Previa ===== */}
          {fase === 'preview' && (
            <Animated.View style={[estilos.previewContainer, { transform: [{ scale: animEscala }] }]}>
              <Text style={estilos.previewIcon}>{sesion.icon}</Text>
              <Text style={estilos.previewTitle}>{sesion.title}</Text>
              <Text style={estilos.previewDuration}>⏱️ {sesion.totalDuration}</Text>
              
              {/* Indicador de dificultad */}
              <View style={estilos.difficultyRow}>
                <Text style={estilos.difficultyLabel}>Nivel: </Text>
                {[1, 2, 3].map(d => (
                  <Text key={d} style={[estilos.difficultyDot, { color: d <= dificultad.puntos ? dificultad.color : 'rgba(255,255,255,0.2)' }]}>●</Text>
                ))}
                <Text style={[estilos.difficultyText, { color: dificultad.color }]}> {dificultad.etiqueta}</Text>
              </View>

              <Text style={estilos.previewDescription}>{sesion.description}</Text>
              
              {/* Beneficios de la sesion */}
              <View style={estilos.benefitsContainer}>
                <Text style={estilos.benefitsTitle}>✨ Beneficios:</Text>
                {sesion.benefits.map((beneficio, indice) => (
                  <View key={indice} style={estilos.benefitRow}>
                    <Text style={estilos.benefitCheck}>✓</Text>
                    <Text style={estilos.benefitItem}>{beneficio}</Text>
                  </View>
                ))}
              </View>

              {/* Vista previa de pasos */}
              <View style={estilos.stepsPreview}>
                <Text style={estilos.stepsPreviewTitle}>📝 Pasos ({sesion.steps.length}):</Text>
                {sesion.steps.map((paso, indice) => (
                  <View key={indice} style={estilos.stepPreviewItem}>
                    <View style={estilos.stepNumberCircle}>
                      <Text style={estilos.stepPreviewNumber}>{indice + 1}</Text>
                    </View>
                    <Text style={estilos.stepPreviewText}>{paso.icon} {paso.title}</Text>
                    <Text style={estilos.stepPreviewDuration}>{formatearTiempo(paso.duration)}</Text>
                  </View>
                ))}
              </View>

              {/* Consejo antes de comenzar */}
              {mostrarConsejo && (
                <View style={estilos.tipContainer}>
                  <Text style={estilos.tipIcon}>💡</Text>
                  <Text style={estilos.tipText}>
                    Buscá un lugar tranquilo, silenciá las notificaciones y sentate cómodamente antes de empezar.
                  </Text>
                  <TouchableOpacity onPress={() => setMostrarConsejo(false)}>
                    <Text style={estilos.tipDismiss}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={estilos.startButton} onPress={iniciarSeguimientoAnimo}>
                <Text style={estilos.startButtonText}>▶️ Comenzar Sesión</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* ===== FASE: Ánimo Antes ===== */}
          {fase === 'mood-before' && (
            <View style={estilos.moodContainer}>
              <Text style={estilos.moodTitle}>¿Cómo te sentís ahora?</Text>
              <Text style={estilos.moodSubtitle}>Seleccioná tu estado de ánimo actual</Text>
              <View style={estilos.moodGrid}>
                {ESTADOS_ANIMO.map(animo => (
                  <TouchableOpacity
                    key={animo.id}
                    style={[estilos.moodOption, animoAntes === animo.id && estilos.moodOptionSelected]}
                    onPress={() => setAnimoAntes(animo.id)}
                  >
                    <Text style={estilos.moodEmoji}>{animo.icon}</Text>
                    <Text style={[estilos.moodLabel, animoAntes === animo.id && estilos.moodLabelSelected]}>{animo.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[estilos.startButton, !animoAntes && estilos.buttonDisabledStyle]}
                onPress={iniciarSesion}
                disabled={!animoAntes}
              >
                <Text style={estilos.startButtonText}>Continuar →</Text>
              </TouchableOpacity>
              <TouchableOpacity style={estilos.skipBtn} onPress={iniciarSesion}>
                <Text style={estilos.skipBtnText}>Omitir</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ===== FASE: Sesión Activa ===== */}
          {pasoActual && fase === 'active' && (
            <Animated.View style={[estilos.activeSession, { transform: [{ scale: animEscala }] }]}>
              {/* Barra de progreso superior */}
              <View style={estilos.progressBar}>
                <View style={[estilos.progressFill, { width: `${progreso * 100}%` }]} />
              </View>
              <View style={estilos.progressInfo}>
                <Text style={estilos.progressText}>
                  Paso {indicePasoActual + 1} de {sesion.steps.length}
                </Text>
                <Text style={estilos.elapsedText}>
                  ⏱️ {formatearTiempo(tiempoTotalTranscurrido)}
                </Text>
              </View>

              {/* Círculo animado de respiración */}
              {pasoActual.breathPattern && (
                <View style={estilos.breathContainer}>
                  <Animated.View style={[estilos.breathOuterRing, { opacity: animBrillo }]} />
                  <Animated.View
                    style={[
                      estilos.breathCircle,
                      { transform: [{ scale: animRespiracion }] },
                    ]}
                  >
                    <Text style={estilos.breathPhaseText}>
                      {faseRespiracion === 'inhale' ? 'INHALÁ' : faseRespiracion === 'hold' ? 'MANTENÉ' : 'EXHALÁ'}
                    </Text>
                    <Text style={estilos.breathCountText}>{conteoRespiracion}</Text>
                    <Text style={estilos.breathSubText}>
                      {faseRespiracion === 'inhale' ? 'por la nariz' : faseRespiracion === 'hold' ? 'el aire' : 'lentamente'}
                    </Text>
                  </Animated.View>
                </View>
              )}

              {/* Contenido del paso actual */}
              <View style={estilos.stepContent}>
                <Text style={estilos.stepIcon}>{pasoActual.icon}</Text>
                <Text style={estilos.stepTitle}>{pasoActual.title}</Text>
                <Text style={estilos.stepInstruction}>{pasoActual.instruction}</Text>
              </View>

              {/* Temporizador */}
              <View style={estilos.timerContainer}>
                <Text style={estilos.timerText}>{formatearTiempo(tiempoRestante)}</Text>
                <Text style={estilos.timerLabel}>restante</Text>
              </View>

              {/* Controles de sesión */}
              <View style={estilos.controlsRow}>
                <TouchableOpacity style={estilos.controlBtn} onPress={detenerSesion}>
                  <Text style={estilos.controlBtnIcon}>⏹️</Text>
                  <Text style={estilos.controlBtnLabel}>Detener</Text>
                </TouchableOpacity>
                <TouchableOpacity style={estilos.pauseBtn} onPress={alternarPausa}>
                  <Text style={estilos.pauseBtnText}>{estaPausado ? '▶️ Reanudar' : '⏸️ Pausar'}</Text>
                </TouchableOpacity>
                {indicePasoActual < sesion.steps.length - 1 ? (
                  <TouchableOpacity style={estilos.controlBtn} onPress={manejarPasoCompleto}>
                    <Text style={estilos.controlBtnIcon}>⏭️</Text>
                    <Text style={estilos.controlBtnLabel}>Siguiente</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={estilos.controlBtn} onPress={() => navigation.navigate('Home', { fromMeditation: true })}>
                    <Text style={[estilos.controlBtnIcon, { color: '#C084FC' }]}>🚪</Text>
                    <Text style={[estilos.controlBtnLabel, { color: '#C084FC' }]}>Salir</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Indicadores de pasos (puntos) */}
              <View style={estilos.stepDots}>
                {sesion.steps.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      estilos.stepDot,
                      i < indicePasoActual && estilos.stepDotCompleted,
                      i === indicePasoActual && estilos.stepDotActive,
                    ]}
                  />
                ))}
              </View>
            </Animated.View>
          )}

          {/* ===== FASE: Ánimo Después ===== */}
          {fase === 'mood-after' && (
            <View style={estilos.moodContainer}>
              <Text style={estilos.moodCompletedBadge}>✅ Sesión Completada</Text>
              <Text style={estilos.moodTitle}>¿Cómo te sentís después?</Text>
              <Text style={estilos.moodSubtitle}>Tu feedback nos ayuda a mejorar tu experiencia</Text>
              <View style={estilos.moodGrid}>
                {ESTADOS_ANIMO.map(animo => (
                  <TouchableOpacity
                    key={animo.id}
                    style={[estilos.moodOption, animoDespues === animo.id && estilos.moodOptionSelected]}
                    onPress={() => setAnimoDespues(animo.id)}
                  >
                    <Text style={estilos.moodEmoji}>{animo.icon}</Text>
                    <Text style={[estilos.moodLabel, animoDespues === animo.id && estilos.moodLabelSelected]}>{animo.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Calificacion con estrellas */}
              <Text style={estilos.ratingTitle}>Calificá esta sesión</Text>
              <View style={estilos.ratingRow}>
                {[1, 2, 3, 4, 5].map(estrella => (
                  <TouchableOpacity key={estrella} onPress={() => setCalificacion(estrella)} style={estilos.starBtn}>
                    <Text style={[estilos.starIcon, estrella <= calificacion && estilos.starActive]}>
                      {estrella <= calificacion ? '★' : '☆'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Diario personal */}
              <Text style={estilos.journalTitle}>📝 Notas personales (opcional)</Text>
              <TextInput
                style={estilos.journalInput}
                multiline
                numberOfLines={4}
                placeholder="¿Cómo fue tu experiencia? ¿Qué pensamientos surgieron?..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={notaDiario}
                onChangeText={setNotaDiario}
              />

              <TouchableOpacity style={estilos.startButton} onPress={completarSesion}>
                <Text style={estilos.startButtonText}>Ver Resumen →</Text>
              </TouchableOpacity>
              <TouchableOpacity style={estilos.skipBtn} onPress={completarSesion}>
                <Text style={estilos.skipBtnText}>Omitir</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ===== FASE: Completada ===== */}
          {fase === 'completed' && (
            <View style={estilos.completedContainer}>
              <Text style={estilos.completedIcon}>🎉</Text>
              <Text style={estilos.completedTitle}>¡Sesión finalizada!</Text>
              <Text style={estilos.completedMessage}>
                ¡Increíble! Completaste "{sesion.title}". Cada momento que dedicás a tu bienestar te acerca a la mejor versión de vos. ¡Seguí así!
              </Text>

              {/* Tarjeta de estadisticas */}
              <View style={estilos.completedStats}>
                <View style={estilos.completedStatItem}>
                  <Text style={estilos.completedStatValue}>{formatearTiempo(tiempoTotalTranscurrido)}</Text>
                  <Text style={estilos.completedStatLabel}>Tiempo total</Text>
                </View>
                <View style={estilos.completedStatDivider} />
                <View style={estilos.completedStatItem}>
                  <Text style={estilos.completedStatValue}>{pasosCompletados}</Text>
                  <Text style={estilos.completedStatLabel}>Pasos</Text>
                </View>
              </View>

              {/* Comparación de ánimo antes/después */}
              {animoAntes && animoDespues && (
                <View style={estilos.moodComparison}>
                  <Text style={estilos.moodCompTitle}>Tu estado de ánimo</Text>
                  <View style={estilos.moodCompRow}>
                    <View style={estilos.moodCompItem}>
                      <Text style={estilos.moodCompEmoji}>{ESTADOS_ANIMO.find(m => m.id === animoAntes)?.icon}</Text>
                      <Text style={estilos.moodCompLabel}>Antes</Text>
                    </View>
                    <Text style={estilos.moodCompArrow}>→</Text>
                    <View style={estilos.moodCompItem}>
                      <Text style={estilos.moodCompEmoji}>{ESTADOS_ANIMO.find(m => m.id === animoDespues)?.icon}</Text>
                      <Text style={estilos.moodCompLabel}>Después</Text>
                    </View>
                  </View>
                </View>
              )}

              <Text style={estilos.completedQuote}>
                "Cada momento de meditación es una semilla de paz plantada en tu interior"
              </Text>
              
              <TouchableOpacity style={estilos.startButton} onPress={() => { detenerSesion(); iniciarSeguimientoAnimo(); }}>
                <Text style={estilos.startButtonText}>🔁 Repetir Sesión</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[estilos.startButton, estilos.secondaryBtn]} 
                onPress={() => navigation.navigate('Home', { fromMeditation: true })}
              >
                <Text style={[estilos.startButtonText, estilos.secondaryBtnText]}>
                  🏠 Volver al Inicio
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
      {/* Mini reproductor fijo en pie de pantalla secundaria */}
      <MiniMusicPlayer />
    </View>
  );
};

/** Hoja de estilos con fuentes minimalistas sans-serif */
const estilos = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: anchoPantalla,
    height: altoPantalla,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.40)',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: 'rgba(147,51,234,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(147,51,234,0.3)',
  },
  backBtnText: {
    color: '#C084FC',
    fontSize: 15,
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
  },
  favBtn: {
    padding: 8,
  },
  favIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },

  // Preview
  previewContainer: {
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
    borderRadius: 28,
    padding: 26,
    borderWidth: 1,
    borderColor: 'rgba(147,51,234,0.2)',
  },
  previewIcon: {
    fontSize: 60,
    textAlign: 'center',
    marginBottom: 12,
    color: '#FFFFFF',
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  previewTitle: {
    fontSize: 32,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
  },
  previewDuration: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  difficultyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  difficultyLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  difficultyDot: {
    fontSize: 14,
    marginHorizontal: 2,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  previewDescription: {
    fontSize: 17,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  benefitsContainer: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(147,51,234,0.2)',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  benefitCheck: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
    fontWeight: '500',
  },
  benefitItem: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  stepsPreview: {
    marginBottom: 24,
  },
  stepsPreviewTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  stepPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  stepNumberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(147, 51, 234, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepPreviewNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  stepPreviewText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  stepPreviewDuration: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  tipIcon: {
    fontSize: 22,
    marginRight: 10,
    color: '#FFFFFF',
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tipDismiss: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.5)',
    paddingLeft: 8,
  },

  startButton: {
    backgroundColor: '#9333EA',
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '500',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonDisabledStyle: {
    opacity: 0.5,
  },
  skipBtn: {
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
  },
  skipBtnText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    fontWeight: '500',
  },

  // Mood tracking
  moodContainer: {
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
    borderRadius: 28,
    padding: 26,
    borderWidth: 1,
    borderColor: 'rgba(147,51,234,0.2)',
  },
  moodCompletedBadge: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  moodTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 5,
  },
  moodSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  moodOption: {
    width: (anchoPantalla - 100) / 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  moodOptionSelected: {
    borderColor: '#9333EA',
    backgroundColor: 'rgba(147,51,234,0.2)',
  },
  moodEmoji: {
    fontSize: 34,
    marginBottom: 6,
    color: '#FFFFFF',
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  moodLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: '#9333EA',
  },

  // Rating
  ratingTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  starBtn: {
    padding: 4,
  },
  starIcon: {
    fontSize: 36,
    color: 'rgba(255,255,255,0.3)',
  },
  starActive: {
    color: '#F5C842',
  },

  // Journal
  journalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  journalInput: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#FFFFFF',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 20,
  },

  // Ambient selection
  ambientContainer: {
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
    borderRadius: 28,
    padding: 26,
    borderWidth: 1,
    borderColor: 'rgba(147,51,234,0.2)',
  },
  ambientTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 5,
  },
  ambientSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  ambientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  ambientOption: {
    width: (anchoPantalla - 100) / 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  ambientOptionSelected: {
    borderColor: '#9333EA',
    backgroundColor: 'rgba(147,51,234,0.2)',
  },
  ambientEmoji: {
    fontSize: 36,
    marginBottom: 8,
    color: '#FFFFFF',
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  ambientLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    textAlign: 'center',
  },
  ambientLabelSelected: {
    color: '#9333EA',
  },
  ambientNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232, 135, 74, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  ambientNoteIcon: {
    fontSize: 20,
    marginRight: 10,
    color: '#FFFFFF',
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  ambientNoteText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Active session
  activeSession: {
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
    borderRadius: 28,
    padding: 26,
    borderWidth: 1,
    borderColor: 'rgba(147,51,234,0.2)',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9333EA',
    borderRadius: 3,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  elapsedText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  ambientIndicator: {
    alignSelf: 'center',
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(147,51,234,0.3)',
  },
  ambientIndicatorText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },

  breathContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  breathOuterRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    borderColor: '#9333EA',
  },
  breathCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    borderWidth: 3,
    borderColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathPhaseText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  breathCountText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#9333EA',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  breathSubText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },

  stepContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepIcon: {
    fontSize: 52,
    marginBottom: 12,
    color: '#FFFFFF',
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 5,
  },
  stepInstruction: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },

  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 52,
    fontWeight: '600',
    color: '#9333EA',
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 5,
  },
  timerLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },

  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  controlBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  controlBtnIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  controlBtnLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pauseBtn: {
    backgroundColor: '#9333EA',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    elevation: 2,
  },
  pauseBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Step dots
  stepDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  stepDotCompleted: {
    backgroundColor: '#9333EA',
  },
  stepDotActive: {
    backgroundColor: '#FFFFFF',
    width: 20,
    borderRadius: 4,
  },

  // Completed
  completedContainer: {
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(147,51,234,0.2)',
  },
  completedIcon: {
    fontSize: 72,
    marginBottom: 16,
    color: '#FFFFFF',
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  completedTitle: {
    fontSize: 30,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
  },
  completedMessage: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  completedStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'space-around',
  },
  completedStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  completedStatValue: {
    fontSize: 22,
    fontWeight: '500',
    color: '#9333EA',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  completedStatLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  completedStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  moodComparison: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  moodCompTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  moodCompRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  moodCompItem: {
    alignItems: 'center',
  },
  moodCompEmoji: {
    fontSize: 40,
    color: '#FFFFFF',
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  moodCompLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  moodCompArrow: {
    fontSize: 28,
    color: '#9333EA',
    fontWeight: '500',
  },
  completedQuote: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginTop: 12,
    elevation: 0,
    shadowOpacity: 0,
  },
  secondaryBtnText: {
    color: '#FFFFFF',
  },
});

export default MeditationSessionScreen;
