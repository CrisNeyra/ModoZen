// ============================================================
// PantallaLogin.tsx — Pantalla de inicio de sesión
// Muestra un video de fondo, el logo "MODO ZEN", botón de idioma
// en la esquina superior derecha, y el formulario de login.
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video from 'react-native-video';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useIdioma } from '../context/LanguageContext';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');
const videoFondoLogin = require('../assets/background0.mp4');

let imagenLogo: any = null;
try { imagenLogo = require('../assets/logo.png'); } catch { imagenLogo = null; }

type ListaPantallas = { Login: undefined; Register: undefined; Home: undefined };
type NavegacionLogin = NativeStackNavigationProp<ListaPantallas, 'Login'>;
interface Props { navigation: NavegacionLogin; }

export const validarContrasena = (contrasena: string): { valida: boolean; mensaje: string } => {
  if (contrasena.length < 4) return { valida: false, mensaje: 'La contraseña debe tener al menos 4 caracteres' };
  return { valida: true, mensaje: '' };
};
export const validarEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const CRED_KEY = '@ModoZen:credenciales';

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const { iniciarSesion } = useAuth();
  const { idioma, t, cambiarIdioma } = useIdioma();

  // Animaciones de entrada
  const animLogo = useRef(new Animated.Value(0)).current;
  const animForm = useRef(new Animated.Value(0)).current;
  const animPie = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(300, [
      Animated.spring(animLogo, { toValue: 1, tension: 40, friction: 7, useNativeDriver: true }),
      Animated.spring(animForm, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.timing(animPie, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [animLogo, animForm, animPie]);

  // Cargar credenciales guardadas
  useEffect(() => {
    (async () => {
      try {
        const guardado = await AsyncStorage.getItem(CRED_KEY);
        if (guardado) {
          const { email: e, contrasena: c } = JSON.parse(guardado);
          if (e) setEmail(e);
          if (c) setContrasena(c);
        }
      } catch {}
    })();
  }, []);

  const manejarLogin = async () => {
    if (!email.trim()) { Alert.alert(t.error, t.errorCampoEmail); return; }
    if (!validarEmail(email.trim())) { Alert.alert(t.error, t.errorEmailInvalido); return; }
    if (!contrasena.trim()) { Alert.alert(t.error, t.errorCampoContrasena); return; }
    const chequeo = validarContrasena(contrasena);
    if (!chequeo.valida) { Alert.alert(t.contrasenaInvalida, t.errorContrasenaInvalida); return; }
    setEstaCargando(true);
    const exito = await iniciarSesion(email.trim().toLowerCase(), contrasena);
    setEstaCargando(false);
    if (exito) {
      // Guardar credenciales para próximo login
      try { await AsyncStorage.setItem(CRED_KEY, JSON.stringify({ email: email.trim().toLowerCase(), contrasena })); } catch {}
    } else {
      Alert.alert(t.error, t.errorLoginFallido);
    }
  };

  return (
    <View style={estilos.contenedorPrincipal}>
      <Video source={videoFondoLogin} style={estilos.videoFondo} resizeMode="cover" repeat muted
        playInBackground={false} playWhenInactive={false} ignoreSilentSwitch="ignore" mixWithOthers="mix"
        rate={1.0} paused={false} maxBitRate={500000} disableFocus
        bufferConfig={{ minBufferMs: 5000, maxBufferMs: 15000, bufferForPlaybackMs: 1000, bufferForPlaybackAfterRebufferMs: 2000 }} />
      <LinearGradient
        colors={['rgba(15,15,35,0.45)', 'rgba(88,28,135,0.35)', 'rgba(15,15,35,0.55)']}
        style={estilos.overlayVideo}
      />

      {/* Botón de idioma — esquina superior derecha */}
      <TouchableOpacity style={estilos.botonIdioma} onPress={() => cambiarIdioma(idioma === 'es' ? 'en' : 'es')} activeOpacity={0.7}>
        <Text style={estilos.textoIdioma}>{idioma === 'es' ? '🌐 ES' : '🌐 EN'}</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView style={estilos.contenedor} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={estilos.contenidoScroll} keyboardShouldPersistTaps="handled">
          {/* Logo + frase */}
          <Animated.View style={[estilos.contenedorEncabezado, {
            opacity: animLogo,
            transform: [{ translateY: animLogo.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) },
              { scale: animLogo.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
          }]}>
            <View style={estilos.contenedorLogo}>
              {imagenLogo ? (
                <Image source={imagenLogo} style={estilos.imagenLogo} resizeMode="contain" />
              ) : (
                <View style={estilos.logoFallback}>
                  <Text style={estilos.emojiLogo}>🧘</Text>
                </View>
              )}
            </View>
            {/* Frase motivacional — degradé púrpura al centro */}
            <LinearGradient
              colors={['rgba(88, 28, 135, 0.7)', 'rgba(147, 51, 234, 0.45)', 'rgba(88, 28, 135, 0.7)']}
              start={{x: 0, y: 0.5}}
              end={{x: 1, y: 0.5}}
              style={estilos.contenedorSubtitulo}
            >
              <Text style={estilos.subtitulo}>{t.fraseLogin}</Text>
            </LinearGradient>
          </Animated.View>

          {/* Formulario */}
          <Animated.View style={[estilos.contenedorFormulario, {
            opacity: animForm,
            transform: [{ translateY: animForm.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
          }]}>
            <Text style={estilos.textoBienvenida}>{t.bienvenidoDeVuelta}</Text>
            <View style={estilos.contenedorInput}>
              <Text style={estilos.etiqueta}>{t.correoElectronico}</Text>
              <TextInput style={estilos.input} placeholder={t.placeholderEmail} placeholderTextColor={colors.textLight}
                value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            </View>
            <View style={estilos.contenedorInput}>
              <Text style={estilos.etiqueta}>{t.contrasena}</Text>
              <View style={estilos.contenedorContrasena}>
                <TextInput style={estilos.inputContrasena} placeholder={t.minimo6} placeholderTextColor={colors.textLight}
                  value={contrasena} onChangeText={setContrasena} secureTextEntry={!mostrarContrasena} />
                <TouchableOpacity style={estilos.botonOjo} onPress={() => setMostrarContrasena(!mostrarContrasena)}>
                  <Text style={estilos.iconoOjo}>{mostrarContrasena ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={estilos.pistaContrasena}>{t.minimo6}</Text>
            </View>
            <TouchableOpacity style={[estilos.boton, estaCargando && estilos.botonDeshabilitado]} onPress={manejarLogin} disabled={estaCargando}>
              {estaCargando ? <ActivityIndicator color={colors.textOnPrimary} /> : <Text style={estilos.textoBoton}>{t.iniciarSesion}</Text>}
            </TouchableOpacity>
            <View style={estilos.separador}>
              <View style={estilos.lineaSeparador} />
              <Text style={estilos.textoSeparador}>{t.o}</Text>
              <View style={estilos.lineaSeparador} />
            </View>
            <TouchableOpacity style={estilos.botonSecundario} onPress={() => navigation.navigate('Register')}>
              <Text style={estilos.textoBotonSecundario}>{t.crearCuenta}</Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.Text style={[estilos.textoPie, { opacity: animPie }]}>{t.pieLogin}</Animated.Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedorPrincipal: { flex: 1 },
  videoFondo: { position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, width, height },
  overlayVideo: { position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 },
  botonIdioma: {
    position: 'absolute', top: Platform.OS === 'ios' ? 54 : 16, right: 16, zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  textoIdioma: { color: '#FFF', fontSize: 13, fontWeight: '500', fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium', letterSpacing: 0.5 },
  contenedor: { flex: 1, backgroundColor: 'transparent' },
  contenidoScroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  contenedorEncabezado: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
  contenedorLogo: { width: 140, height: 140, borderRadius: 70, overflow: 'hidden', marginBottom: 20, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
  imagenLogo: { width: '120%', height: '120%' },
  // Frase motivacional — degradé púrpura al centro
  contenedorSubtitulo: {
    borderRadius: 20, paddingHorizontal: 28, paddingVertical: 16,
    marginTop: 14,
  },
  subtitulo: {
    fontSize: 22, color: '#FFFFFF', fontWeight: '500', textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
    textShadowColor: '#9333EA', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20, letterSpacing: 1.5,
  },
  contenedorFormulario: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: 28, shadowColor: '#9333EA', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8, borderWidth: 1.5, borderColor: 'rgba(147,51,234,0.35)' },
  textoBienvenida: { fontSize: 20, fontWeight: '400', color: '#7C22CE', textAlign: 'center', marginBottom: 24, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light', letterSpacing: 0.5 },
  contenedorInput: { marginBottom: 16 },
  etiqueta: { fontSize: 13, fontWeight: '500', color: '#9333EA', marginBottom: 8, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium' },
  input: { backgroundColor: 'rgba(243,236,249,0.9)', borderRadius: 14, padding: 16, fontSize: 15, color: colors.textPrimary, borderWidth: 1.5, borderColor: 'rgba(147,51,234,0.4)', fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir' },
  contenedorContrasena: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(243,236,249,0.9)', borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(147,51,234,0.4)' },
  inputContrasena: { flex: 1, padding: 16, fontSize: 15, color: colors.textPrimary, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir' },
  botonOjo: { paddingHorizontal: 14, paddingVertical: 16 },
  iconoOjo: { fontSize: 20, color: '#FFFFFF', textShadowColor: 'rgba(255,255,255,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 },
  pistaContrasena: { fontSize: 11, color: colors.textLight, marginTop: 6, fontStyle: 'italic', fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light' },
  boton: { backgroundColor: '#9333EA', borderRadius: 18, padding: 18, alignItems: 'center', marginTop: 8, shadowColor: '#9333EA', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  botonDeshabilitado: { backgroundColor: colors.primaryLight },
  textoBoton: { color: colors.textOnPrimary, fontSize: 16, fontWeight: '500', fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium', letterSpacing: 0.5 },
  separador: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  lineaSeparador: { flex: 1, height: 1, backgroundColor: colors.border },
  textoSeparador: { marginHorizontal: 16, color: colors.textLight, fontSize: 13, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir' },
  botonSecundario: { borderWidth: 2, borderColor: '#9333EA', borderRadius: 16, padding: 16, alignItems: 'center', backgroundColor: 'rgba(147,51,234,0.08)' },
  textoBotonSecundario: { color: '#9333EA', fontSize: 15, fontWeight: '500', fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium' },
  textoPie: { textAlign: 'center', color: '#FFF', fontSize: 13, marginTop: 32, fontStyle: 'italic', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light' },
  logoFallback: { width: '100%', height: '100%', backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', borderRadius: 32 },
  emojiLogo: { fontSize: 64, color: '#FFFFFF', textShadowColor: 'rgba(255,255,255,0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 },
});

export default LoginScreen;
