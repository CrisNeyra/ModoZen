// ============================================================
// LanguageContext.tsx — Contexto de idioma (ES/EN)
// Permite cambiar el idioma de toda la app entre español e inglés.
// Persiste la preferencia en AsyncStorage.
// ============================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipos de idioma soportados
export type Idioma = 'es' | 'en';

// Clave de almacenamiento
const CLAVE_IDIOMA = '@ModoZen:idioma_v2';

// ============================================================
// Diccionarios de traducciones
// ============================================================
const traducciones = {
  es: {
    // --- Login ---
    modoZen: 'MODO ZEN',
    fraseLogin: 'Encendé tu calma',
    bienvenidoDeVuelta: 'Tu bienestar es tu mayor éxito. Bienvenido.',
    correoElectronico: 'Correo electrónico',
    contrasena: 'Contraseña',
    minimo6: 'Mínimo 4 caracteres',
    iniciarSesion: 'Iniciar Sesión',
    o: 'o',
    crearCuenta: 'Crear una cuenta',
    pieLogin: 'Tu camino hacia la calma empieza acá',
    placeholderEmail: 'tu@email.com',
    // --- Login errors ---
    errorCampoEmail: 'Por favor ingresá tu correo electrónico',
    errorEmailInvalido: 'Ingresá un correo electrónico válido',
    errorCampoContrasena: 'Por favor ingresá tu contraseña',
    errorContrasenaInvalida: 'La contraseña debe tener al menos 4 caracteres',
    errorLoginFallido: 'No se pudo iniciar sesión. Verificá tus datos.',
    error: 'Error',
    contrasenaInvalida: 'Contraseña inválida',

    // --- Register ---
    uniteAModoZen: 'Unite a Modo Zen',
    empezaTuCamino: 'Empezá tu camino de bienestar',
    nombre: 'Nombre',
    tuNombre: 'Tu nombre',
    confirmarContrasena: 'Confirmar contraseña',
    repetiContrasena: 'Repetí tu contraseña',
    crearCuentaBoton: 'Crear Cuenta',
    yaTengoCuenta: 'Ya tengo una cuenta',
    pieRegistro: 'Al registrarte, aceptás nuestros términos de uso',
    errorNombre: 'Por favor ingresá tu nombre',
    errorNombreCorto: 'El nombre debe tener al menos 2 caracteres',
    errorRegistroFallido: 'No se pudo crear la cuenta. Probá de nuevo.',
    errorContrasenasNoCoinciden: 'Las contraseñas no coinciden',
    errorCampoContrasenaVacio: 'Por favor ingresá una contraseña',
    debil: 'Fácil',
    regular: 'Media',
    buena: 'Buena',
    fuerte: 'Fuerte',
    muyFuerte: 'Muy fuerte',

    // --- Home ---
    saludo_madrugada: '¡Qué lindo que estés acá tan temprano!',
    saludo_manana: '¡Buen día, qué alegría verte!',
    saludo_mediodia: '¡Hola! ¿Cómo va tu día?',
    saludo_tarde: '¡Buenas tardes! Un gusto tenerte',
    saludo_noche: '¡Buenas noches!',
    saludo_trasnoche: '¡Hola, noctámbulo/a! Bienvenido/a',
    viajero: 'Viajero',
    salir: 'Salir',
    tuMensajePositivo: 'Tu mensaje positivo del día',
    musicaMeditar: 'Música para Meditar',
    diasSeguidos: 'Días seguidos',
    minutosHoy: 'Minutos hoy',
    sesiones: 'Sesiones',
    sesionesDeMeditacion: 'Sesiones de Meditación',
    elegiTuMomento: 'Elegí tu momento zen',
    sonidos: 'Sonidos',
    progreso: 'Progreso',
    ajustes: 'Ajustes',
    deslizaVerMas: 'Deslizá para ver más',

    // --- Frases del día ---
    frases: [
      'Hoy es un buen día para hablarte con cariño.',
      'Respirá, bajá un cambio y volvés a vos.',
      'Sos más fuerte de lo que creés.',
      'Tu calma también es una forma de valentía.',
      'Un paso suave hoy vale un montón.',
      'Confiá en tu camino, estás creciendo.',
      'Tu energía cambia cuando te tratás bien.',
      'Todo pasa, vos seguí respirando.',
      'Merecés paz, incluso en días difíciles.',
      'Tu luz no se apaga, solo se acomoda.',
      'Hoy elegí cuidarte un poquito más.',
      'Siempre podés volver a empezar, desde ahora.',
    ],

    // --- Sesiones de meditación ---
    sesion1_titulo: 'Respiración Profunda',
    sesion1_desc: 'Calmá tu mente con ejercicios de respiración',
    sesion2_titulo: 'Calma Matutina',
    sesion2_desc: 'Empezá tu día con energía positiva',
    sesion3_titulo: 'Relajación Nocturna',
    sesion3_desc: 'Preparate para un sueño reparador',
    sesion4_titulo: 'Naturaleza',
    sesion4_desc: 'Conectá con los sonidos del bosque',
    sesion5_titulo: 'Reducir Estrés',
    sesion5_desc: 'Liberá tensiones y encontrá paz',
    sesion6_titulo: 'Enfoque Mental',
    sesion6_desc: 'Mejorá tu concentración y claridad',

    // --- MusicPlayer ---
    auricularesTip: 'Usá auriculares para una experiencia inmersiva de meditación',
    listaReproduccion: 'Lista de Reproducción',
    pistas: 'pistas',

    // --- Bottom Screens ---
    tituloSonidos: 'Sonidos Ambientales',
    subtituloSonidos: 'Tus pistas de meditación',
    pistaActual: 'Reproduciendo ahora',
    todasLasPistas: 'Todas las pistas',
    agregarPistas: 'Próximamente: agregar tus propias pistas',

    tituloProgreso: 'Tu Progreso',
    subtituloProgreso: 'Estadísticas de bienestar',
    tiempoTotal: 'Tiempo total',
    sesionesTotales: 'Sesiones totales',
    rachaActual: 'Racha actual',
    mejorRacha: 'Mejor racha',
    minutos: 'min',
    dias: 'días',
    resumenSemanal: 'Resumen semanal',
    sinDatosTodavia: 'Empezá tu primera sesión para ver tu progreso acá',

    tituloAjustes: 'Ajustes',
    subtituloAjustes: 'Personalizá tu experiencia',
    idioma: 'Idioma',
    espanol: 'Español',
    ingles: 'English',
    notificaciones: 'Notificaciones',
    recordatoriosMeditacion: 'Recordatorios de meditación',
    tema: 'Tema',
    oscuro: 'Oscuro',
    claro: 'Claro',
    acercaDe: 'Acerca de',
    versionApp: 'Modo Zen v1.0.0',
    cerrarSesion: 'Cerrar Sesión',
    volver: 'Volver',

    // --- Nuevas pantallas ---
    sugeridoParaTi: 'Sesiones sugeridas para vos',
    explorar: 'Explorar',
    descubrirMas: 'Descubrí más contenido',
    deslizaExplorar: 'Deslizá para explorar',
    temporizador: 'Temporizador',
    temporizadorSub: 'Contá minutos de relajación',
    historias: 'Historias',
    historiasTitulo: 'Historias para Dormir',
    historiasSub: 'Relatos que te llevan al sueño',
    escuchar: 'Escuchar',
    masHistorias: 'Próximamente: más historias y narraciones',
    videosRelajantes: 'Videos relajantes',
    videosRelajantesSub: 'Videos de meditación y relajación',
    caminatas: 'Caminatas',
    caminatasTitulo: 'Caminatas Meditativas',
    caminatasSub: 'Meditación en movimiento',
    tipCaminata: 'Usá auriculares y elegí un lugar seguro para caminar. Mantené la atención al entorno mientras seguís las instrucciones de audio.',
    masCaminatas: 'Próximamente: más rutas y meditaciones en movimiento',
    biofeedback: 'Biofeedback',
    biofeedbackTitulo: 'Biofeedback',
    biofeedbackSub: 'Conectá tu dispositivo y registrá tu relajación',
    dispositivoConectado: 'Dispositivo conectado',
    sinDispositivo: 'Sin dispositivo conectado',
    conectarDispositivo: 'Conectar Dispositivo',
    conectar: 'Conectar',
    ritmoCardiaco: 'Ritmo Cardíaco',
    curvaRelajacion: 'Curva de Relajación',
    descensoBPM: 'Descenso de BPM durante la sesión',
    relajacionExcelente: '¡Excelente relajación! Tu ritmo descendió significativamente.',
    relajacionBuena: 'Buena relajación. Tu cuerpo está respondiendo.',
    relajacionInicial: 'Seguí practicando para ver mejoras en tu relajación.',
    compatibilidad: 'Compatibilidad',
    infoWearables: 'Compatible con Apple Watch, Fitbit, Garmin y sensores BLE.',
  },
  en: {
    // --- Login ---
    modoZen: 'MODO ZEN',
    fraseLogin: 'Light up your calm',
    bienvenidoDeVuelta: 'Your well-being is your greatest success. Welcome.',
    correoElectronico: 'Email',
    contrasena: 'Password',
    minimo6: 'At least 4 characters',
    iniciarSesion: 'Sign In',
    o: 'or',
    crearCuenta: 'Create an account',
    pieLogin: 'Your path to calm starts here',
    placeholderEmail: 'you@email.com',
    // --- Login errors ---
    errorCampoEmail: 'Please enter your email',
    errorEmailInvalido: 'Enter a valid email address',
    errorCampoContrasena: 'Please enter your password',
    errorContrasenaInvalida: 'Password must be at least 4 characters',
    errorLoginFallido: 'Could not sign in. Please check your credentials.',
    error: 'Error',
    contrasenaInvalida: 'Invalid password',

    // --- Register ---
    uniteAModoZen: 'Join Modo Zen',
    empezaTuCamino: 'Start your wellness journey',
    nombre: 'Name',
    tuNombre: 'Your name',
    confirmarContrasena: 'Confirm password',
    repetiContrasena: 'Repeat your password',
    crearCuentaBoton: 'Create Account',
    yaTengoCuenta: 'I already have an account',
    pieRegistro: 'By signing up, you accept our terms of use',
    errorNombre: 'Please enter your name',
    errorNombreCorto: 'Name must be at least 2 characters',
    errorRegistroFallido: 'Could not create account. Please try again.',
    errorContrasenasNoCoinciden: 'Passwords do not match',
    errorCampoContrasenaVacio: 'Please enter a password',
    debil: 'Easy',
    regular: 'Medium',
    buena: 'Good',
    fuerte: 'Strong',
    muyFuerte: 'Very strong',

    // --- Home ---
    saludo_madrugada: 'So nice to have you here this early!',
    saludo_manana: 'Good morning, great to see you!',
    saludo_mediodia: 'Hey there! How\'s your day going?',
    saludo_tarde: 'Good afternoon! Nice to have you',
    saludo_noche: 'Good evening!',
    saludo_trasnoche: 'Hey night owl! Welcome',
    viajero: 'Traveler',
    salir: 'Log out',
    tuMensajePositivo: 'Your positive message of the day',
    musicaMeditar: 'Music for Meditation',
    diasSeguidos: 'Day streak',
    minutosHoy: 'Minutes today',
    sesiones: 'Sessions',
    sesionesDeMeditacion: 'Meditation Sessions',
    elegiTuMomento: 'Choose your zen moment',
    sonidos: 'Sounds',
    progreso: 'Progress',
    ajustes: 'Settings',
    deslizaVerMas: 'Swipe to see more',

    // --- Frases del día ---
    frases: [
      'Today is a good day to be kind to yourself.',
      'Take a breath and come back to your center.',
      'You are stronger than you think.',
      'Calm is also a kind of courage.',
      'One gentle step today is enough.',
      'Trust your path, you are growing.',
      'Your energy shifts when you treat yourself with care.',
      'This will pass, keep breathing.',
      'You deserve peace, even on hard days.',
      'Your light is still there, always.',
      'Choose yourself a little more today.',
      'You can begin again, starting now.',
    ],

    // --- Sesiones de meditación ---
    sesion1_titulo: 'Deep Breathing',
    sesion1_desc: 'Calm your mind with breathing exercises',
    sesion2_titulo: 'Morning Calm',
    sesion2_desc: 'Start your day with positive energy',
    sesion3_titulo: 'Night Relaxation',
    sesion3_desc: 'Prepare for a restful sleep',
    sesion4_titulo: 'Nature',
    sesion4_desc: 'Connect with the sounds of the forest',
    sesion5_titulo: 'Stress Relief',
    sesion5_desc: 'Release tension and find peace',
    sesion6_titulo: 'Mental Focus',
    sesion6_desc: 'Improve your concentration and clarity',

    // --- MusicPlayer ---
    auricularesTip: 'Use headphones for an immersive meditation experience',
    listaReproduccion: 'Playlist',
    pistas: 'tracks',

    // --- Bottom Screens ---
    tituloSonidos: 'Ambient Sounds',
    subtituloSonidos: 'Your meditation tracks',
    pistaActual: 'Now playing',
    todasLasPistas: 'All tracks',
    agregarPistas: 'Coming soon: add your own tracks',

    tituloProgreso: 'Your Progress',
    subtituloProgreso: 'Wellness statistics',
    tiempoTotal: 'Total time',
    sesionesTotales: 'Total sessions',
    rachaActual: 'Current streak',
    mejorRacha: 'Best streak',
    minutos: 'min',
    dias: 'days',
    resumenSemanal: 'Weekly summary',
    sinDatosTodavia: 'Start your first session to see your progress here',

    tituloAjustes: 'Settings',
    subtituloAjustes: 'Customize your experience',
    idioma: 'Language',
    espanol: 'Español',
    ingles: 'English',
    notificaciones: 'Notifications',
    recordatoriosMeditacion: 'Meditation reminders',
    tema: 'Theme',
    oscuro: 'Dark',
    claro: 'Light',
    acercaDe: 'About',
    versionApp: 'Modo Zen v1.0.0',
    cerrarSesion: 'Sign Out',
    volver: 'Back',

    // --- New screens ---
    sugeridoParaTi: 'Sessions suggested for you',
    explorar: 'Explore',
    descubrirMas: 'Discover more content',
    deslizaExplorar: 'Swipe to explore',
    temporizador: 'Timer',
    temporizadorSub: 'Count minutes of relaxation',
    historias: 'Stories',
    historiasTitulo: 'Sleep Stories',
    historiasSub: 'Tales that guide you to sleep',
    escuchar: 'Listen',
    masHistorias: 'Coming soon: more stories and narrations',
    videosRelajantes: 'Relaxing Videos',
    videosRelajantesSub: 'Meditation and relaxation videos',
    caminatas: 'Walks',
    caminatasTitulo: 'Meditation Walks',
    caminatasSub: 'Meditation in motion',
    tipCaminata: 'Use headphones and choose a safe place to walk. Stay aware of your surroundings while following the audio.',
    masCaminatas: 'Coming soon: more routes and walking meditations',
    biofeedback: 'Biofeedback',
    biofeedbackTitulo: 'Biofeedback',
    biofeedbackSub: 'Connect your device and track your relaxation',
    dispositivoConectado: 'Device connected',
    sinDispositivo: 'No device connected',
    conectarDispositivo: 'Connect Device',
    conectar: 'Connect',
    ritmoCardiaco: 'Heart Rate',
    curvaRelajacion: 'Relaxation Curve',
    descensoBPM: 'BPM descent during session',
    relajacionExcelente: 'Excellent relaxation! Your heart rate dropped significantly.',
    relajacionBuena: 'Good relaxation. Your body is responding.',
    relajacionInicial: 'Keep practicing to see improvement in your relaxation.',
    compatibilidad: 'Compatibility',
    infoWearables: 'Compatible with Apple Watch, Fitbit, Garmin and BLE sensors.',
  },
};

// Tipo para las traducciones
export type Traducciones = typeof traducciones.es;

// Tipo del contexto
interface TipoContextoIdioma {
  idioma: Idioma;
  t: Traducciones;
  cambiarIdioma: (nuevoIdioma: Idioma) => void;
}

const ContextoIdioma = createContext<TipoContextoIdioma | undefined>(undefined);

// ============================================================
// Proveedor de idioma
// ============================================================
export const ProveedorIdioma: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [idioma, setIdioma] = useState<Idioma>('es');

  // Cargar idioma persistido al iniciar
  useEffect(() => {
    const cargarIdioma = async () => {
      try {
        const guardado = await AsyncStorage.getItem(CLAVE_IDIOMA);
        if (guardado === 'en' || guardado === 'es') {
          setIdioma(guardado);
        }
      } catch {}
    };
    cargarIdioma();
  }, []);

  // Cambiar idioma y persistir
  const cambiarIdioma = async (nuevoIdioma: Idioma) => {
    setIdioma(nuevoIdioma);
    try {
      await AsyncStorage.setItem(CLAVE_IDIOMA, nuevoIdioma);
    } catch {}
  };

  const t = traducciones[idioma];

  return (
    <ContextoIdioma.Provider value={{ idioma, t, cambiarIdioma }}>
      {children}
    </ContextoIdioma.Provider>
  );
};

// Hook para usar el idioma
export const useIdioma = (): TipoContextoIdioma => {
  const contexto = useContext(ContextoIdioma);
  if (!contexto) {
    throw new Error('useIdioma debe usarse dentro de ProveedorIdioma');
  }
  return contexto;
};

export default ProveedorIdioma;
