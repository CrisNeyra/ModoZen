// ============================================================
// PantallaRegistro.tsx — Pantalla de creación de cuenta
// Formulario con nombre, email, contraseña + confirmación,
// indicador de fuerza y traducción ES/EN via useIdioma().
// ============================================================

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import Video from 'react-native-video';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useIdioma } from '../context/LanguageContext';
import { validarContrasena, validarEmail } from './LoginScreen';
import { colors } from '../theme/colors';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');
const videoFondo = require('../assets/background0.mp4');

let imagenLogo: any = null;
try { imagenLogo = require('../assets/logo.png'); } catch { imagenLogo = null; }

type ListaPantallas = { Login: undefined; Register: undefined; Home: undefined };
type NavegacionRegistro = NativeStackNavigationProp<ListaPantallas, 'Register'>;
interface Props { navigation: NavegacionRegistro; }

// ============================================================
// Cálculo de fuerza de la contraseña
// ============================================================
const calcularFuerza = (contrasena: string): { nivel: number; color: string } => {
  if (!contrasena) return { nivel: 0, color: 'transparent' };
  let puntos = 0;
  if (contrasena.length >= 4) puntos++;
  if (contrasena.length >= 6) puntos++;
  if (/[0-9]/.test(contrasena) || /[A-Z]/.test(contrasena)) puntos++;
  const coloresFuerza = ['#F5C842', '#8BC34A', '#4CAF50'];
  return { nivel: puntos, color: puntos > 0 ? coloresFuerza[Math.min(puntos - 1, 2)] : 'transparent' };
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const { registrarse } = useAuth();
  const { idioma, t, cambiarIdioma } = useIdioma();

  // Animaciones de entrada
  const animEncabezado = useRef(new Animated.Value(0)).current;
  const animCard = useRef(new Animated.Value(0)).current;
  const animPie = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(250, [
      Animated.spring(animEncabezado, { toValue: 1, tension: 40, friction: 7, useNativeDriver: true }),
      Animated.spring(animCard, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.timing(animPie, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [animEncabezado, animCard, animPie]);

  const fuerza = useMemo(() => calcularFuerza(contrasena), [contrasena]);

  const etiquetaFuerza = (): string => {
    const etiquetas = [t.debil, t.regular, t.buena];
    if (fuerza.nivel === 0) return '';
    return etiquetas[Math.min(fuerza.nivel - 1, 2)];
  };

  const manejarRegistro = async () => {
    if (!nombre.trim()) { Alert.alert(t.error, t.errorNombre); return; }
    if (nombre.trim().length < 2) { Alert.alert(t.error, t.errorNombreCorto); return; }
    if (!email.trim()) { Alert.alert(t.error, t.errorCampoEmail); return; }
    if (!validarEmail(email.trim())) { Alert.alert(t.error, t.errorEmailInvalido); return; }
    if (!contrasena.trim()) { Alert.alert(t.error, t.errorCampoContrasenaVacio); return; }
    const chequeo = validarContrasena(contrasena);
    if (!chequeo.valida) { Alert.alert(t.error, t.errorContrasenaInvalida); return; }
    if (contrasena !== confirmarContrasena) { Alert.alert(t.error, t.errorContrasenasNoCoinciden); return; }
    setEstaCargando(true);
    const exito = await registrarse(nombre.trim(), email.trim().toLowerCase(), contrasena);
    setEstaCargando(false);
    if (!exito) Alert.alert(t.error, t.errorRegistroFallido);
  };

  return (
    <View style={estilos.raiz}>
      <Video source={videoFondo} style={estilos.videoFondo} resizeMode="cover" repeat muted
        playInBackground={false} playWhenInactive={false} ignoreSilentSwitch="ignore" mixWithOthers="mix"
        rate={1.0} paused={false} maxBitRate={500000} disableFocus
        bufferConfig={{ minBufferMs: 5000, maxBufferMs: 15000, bufferForPlaybackMs: 1000, bufferForPlaybackAfterRebufferMs: 2000 }} />
      <LinearGradient
        colors={['rgba(15,15,35,0.45)', 'rgba(88,28,135,0.35)', 'rgba(15,15,35,0.55)']}
        style={estilos.overlay}
      />

      {/* Botón idioma — esquina superior derecha */}
      <TouchableOpacity style={estilos.botonIdioma} onPress={() => cambiarIdioma(idioma === 'es' ? 'en' : 'es')} activeOpacity={0.7}>
        <Text style={estilos.textoIdioma}>{idioma === 'es' ? '🌐 ES' : '🌐 EN'}</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView style={estilos.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={estilos.scroll} keyboardShouldPersistTaps="handled">
          {/* Encabezado */}
          <Animated.View style={[estilos.encabezado, {
            opacity: animEncabezado,
            transform: [{ translateY: animEncabezado.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) },
              { scale: animEncabezado.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
          }]}>
            <View style={estilos.contenedorLogo}>
              {imagenLogo ? (
                <>
                  <Image source={imagenLogo} style={estilos.imagenLogo} resizeMode="cover" />
                  <View style={estilos.overlayLogo}>
                    <Text style={estilos.textoLogo}>{t.modoZen}</Text>
                  </View>
                </>
              ) : (
                <View style={estilos.logoFallback}>
                  <Text style={estilos.emojiLogo}>🧘</Text>
                  <Text style={estilos.textoFallback}>{t.modoZen}</Text>
                </View>
              )}
            </View>
            <Text style={estilos.titulo}>{t.uniteAModoZen}</Text>
            <Text style={estilos.subtitulo}>{t.empezaTuCamino}</Text>
          </Animated.View>

          {/* Formulario */}
          <Animated.View style={[estilos.card, {
            opacity: animCard,
            transform: [{ translateY: animCard.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
          }]}>
            {/* Nombre */}
            <View style={estilos.campoGrupo}>
              <Text style={estilos.etiqueta}>{t.nombre}</Text>
              <TextInput style={estilos.input} placeholder={t.tuNombre} placeholderTextColor={colors.textLight}
                value={nombre} onChangeText={setNombre} autoCapitalize="words" />
            </View>

            {/* Email */}
            <View style={estilos.campoGrupo}>
              <Text style={estilos.etiqueta}>{t.correoElectronico}</Text>
              <TextInput style={estilos.input} placeholder={t.placeholderEmail} placeholderTextColor={colors.textLight}
                value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            </View>

            {/* Contraseña */}
            <View style={estilos.campoGrupo}>
              <Text style={estilos.etiqueta}>{t.contrasena}</Text>
              <View style={estilos.filaPwd}>
                <TextInput style={estilos.inputPwd} placeholder={t.minimo6} placeholderTextColor={colors.textLight}
                  value={contrasena} onChangeText={setContrasena} secureTextEntry={!mostrarContrasena} />
                <TouchableOpacity style={estilos.ojo} onPress={() => setMostrarContrasena(!mostrarContrasena)}>
                  <Text style={estilos.iconoOjo}>{mostrarContrasena ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              {/* Barra de fuerza */}
              {contrasena.length > 0 && (
                <View style={estilos.fuerzaFila}>
                  <View style={estilos.fuerzaFondo}>
                    <View style={[estilos.fuerzaBarra, { width: `${(fuerza.nivel / 3) * 100}%`, backgroundColor: fuerza.color }]} />
                  </View>
                  <Text style={[estilos.fuerzaTexto, { color: fuerza.color }]}>{etiquetaFuerza()}</Text>
                </View>
              )}
            </View>

            {/* Confirmar contraseña */}
            <View style={estilos.campoGrupo}>
              <Text style={estilos.etiqueta}>{t.confirmarContrasena}</Text>
              <View style={estilos.filaPwd}>
                <TextInput style={estilos.inputPwd} placeholder={t.repetiContrasena} placeholderTextColor={colors.textLight}
                  value={confirmarContrasena} onChangeText={setConfirmarContrasena} secureTextEntry={!mostrarConfirmar} />
                <TouchableOpacity style={estilos.ojo} onPress={() => setMostrarConfirmar(!mostrarConfirmar)}>
                  <Text style={estilos.iconoOjo}>{mostrarConfirmar ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Botón registrar */}
            <TouchableOpacity style={[estilos.boton, estaCargando && estilos.botonOff]} onPress={manejarRegistro} disabled={estaCargando}>
              {estaCargando ? <ActivityIndicator color="#FFF" /> : <Text style={estilos.textoBoton}>{t.crearCuentaBoton}</Text>}
            </TouchableOpacity>

            {/* Link a login */}
            <View style={estilos.separador}>
              <View style={estilos.linea} />
              <Text style={estilos.textoSep}>{t.o}</Text>
              <View style={estilos.linea} />
            </View>
            <TouchableOpacity style={estilos.botonSec} onPress={() => navigation.goBack()}>
              <Text style={estilos.textoBotonSec}>{t.yaTengoCuenta}</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.Text style={[estilos.pie, { opacity: animPie }]}>{t.pieRegistro}</Animated.Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// ============================================================
// Estilos
// ============================================================
const estilos = StyleSheet.create({
  raiz: { flex: 1 },
  flex: { flex: 1, backgroundColor: 'transparent' },
  videoFondo: { position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, width, height },
  overlay: { position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 },
  botonIdioma: {
    position: 'absolute', top: Platform.OS === 'ios' ? 54 : 16, right: 16, zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  textoIdioma: { color: '#FFF', fontSize: 14, fontWeight: '600', fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium', letterSpacing: 0.5 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  encabezado: { alignItems: 'center', marginBottom: 28 },
  contenedorLogo: {
    width: 180, height: 140, borderRadius: 24, overflow: 'hidden', marginBottom: 14,
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  imagenLogo: { width: '100%', height: '100%' },
  overlayLogo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  textoLogo: { fontSize: 32, fontWeight: '200', color: 'rgba(255,255,255,0.95)', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 2, height: 3 }, textShadowRadius: 8, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light', letterSpacing: 6 },
  logoFallback: { width: '100%', height: '100%', backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  emojiLogo: { fontSize: 36, marginBottom: 6, color: '#FFFFFF', textShadowColor: 'rgba(255,255,255,0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 },
  textoFallback: { fontSize: 26, fontWeight: '200', color: '#FFF', fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light', letterSpacing: 5, textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 2, height: 3 }, textShadowRadius: 8 },
  titulo: { fontSize: 28, fontWeight: '500', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium', letterSpacing: 0.5 },
  subtitulo: { fontSize: 16, color: 'rgba(255,255,255,0.85)', marginTop: 6, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: 26,
    shadowColor: '#9333EA', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20,
    elevation: 8, borderWidth: 1.5, borderColor: 'rgba(147,51,234,0.35)',
  },
  campoGrupo: { marginBottom: 16 },
  etiqueta: { fontSize: 14, fontWeight: '500', color: '#9333EA', marginBottom: 8, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium' },
  input: { backgroundColor: 'rgba(243,236,249,0.9)', borderRadius: 14, padding: 16, fontSize: 16, color: colors.textPrimary, borderWidth: 1.5, borderColor: 'rgba(147,51,234,0.4)', fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir' },
  filaPwd: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(243,236,249,0.9)', borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(147,51,234,0.4)' },
  inputPwd: { flex: 1, padding: 16, fontSize: 16, color: colors.textPrimary, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir' },
  ojo: { paddingHorizontal: 14, paddingVertical: 16 },
  iconoOjo: { fontSize: 20, color: '#FFFFFF', textShadowColor: 'rgba(255,255,255,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 },
  fuerzaFila: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  fuerzaFondo: { flex: 1, height: 5, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden', marginRight: 10 },
  fuerzaBarra: { height: '100%', borderRadius: 3 },
  fuerzaTexto: { fontSize: 12, fontWeight: '600', fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium' },
  boton: { backgroundColor: '#9333EA', borderRadius: 18, padding: 18, alignItems: 'center', marginTop: 8, shadowColor: '#9333EA', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  botonOff: { backgroundColor: colors.primaryLight },
  textoBoton: { color: '#FFF', fontSize: 17, fontWeight: '500', fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium', letterSpacing: 0.5 },
  separador: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  linea: { flex: 1, height: 1, backgroundColor: colors.border },
  textoSep: { marginHorizontal: 16, color: colors.textLight, fontSize: 14, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir' },
  botonSec: { borderWidth: 2, borderColor: '#9333EA', borderRadius: 16, padding: 16, alignItems: 'center', backgroundColor: 'rgba(147,51,234,0.08)' },
  textoBotonSec: { color: '#9333EA', fontSize: 16, fontWeight: '500', fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium' },
  pie: { textAlign: 'center', color: '#FFF', fontSize: 13, marginTop: 28, fontStyle: 'italic', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2, fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light' },
});

export default RegisterScreen;
