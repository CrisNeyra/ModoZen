// ============================================================
// PantallaAjustes.tsx — Configuración de la app
// Mejorada con gradientes, animaciones y diseño moderno.
// ============================================================

import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Switch,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useIdioma } from '../context/LanguageContext';

type Nav = NativeStackNavigationProp<any>;
interface Props { navigation: Nav; }

const AjustesScreen: React.FC<Props> = ({ navigation }) => {
  const { cerrarSesion } = useAuth();
  const { idioma, t, cambiarIdioma } = useIdioma();
  const [notis, setNotis] = React.useState(false);

  // Animaciones
  const animHeader = useRef(new Animated.Value(0)).current;
  const animSecciones = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(animHeader, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.stagger(100,
      animSecciones.map(a => Animated.spring(a, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }))
    ).start();
  }, [animHeader, animSecciones]);

  return (
    <View style={s.raiz}>
      <LinearGradient colors={['#0F0F23', '#1A1A2E', '#16213E']} style={s.fondo}>
        {/* Encabezado */}
        <Animated.View style={[s.header, {
          opacity: animHeader,
          transform: [{ translateY: animHeader.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
            <Text style={s.backTxt}>← {t.volver}</Text>
          </TouchableOpacity>
          <Text style={s.titulo}>{t.tituloAjustes}</Text>
          <Text style={s.sub}>{t.subtituloAjustes}</Text>
        </Animated.View>

        <ScrollView contentContainerStyle={s.contenido} showsVerticalScrollIndicator={false}>
          {/* Idioma */}
          <Animated.View style={{
            opacity: animSecciones[0],
            transform: [{ translateY: animSecciones[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }}>
            <View style={s.seccion}>
              <View style={s.seccionHeaderRow}>
                <LinearGradient colors={['#3B82F6', '#1D4ED8']} style={s.seccionIconWrap}>
                  <Text style={s.seccionIcono}>◉</Text>
                </LinearGradient>
                <Text style={s.seccionTitulo}>{t.idioma}</Text>
              </View>
              <View style={s.filaBtns}>
                <TouchableOpacity
                  style={[s.idiomaBtn, idioma === 'es' && s.idiomaBtnActivo]}
                  onPress={() => cambiarIdioma('es')} activeOpacity={0.7}>
                  <Text style={[s.idiomaTxt, idioma === 'es' && s.idiomaTxtActivo]}>ES • {t.espanol}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.idiomaBtn, idioma === 'en' && s.idiomaBtnActivo]}
                  onPress={() => cambiarIdioma('en')} activeOpacity={0.7}>
                  <Text style={[s.idiomaTxt, idioma === 'en' && s.idiomaTxtActivo]}>EN • {t.ingles}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Notificaciones */}
          <Animated.View style={{
            opacity: animSecciones[1],
            transform: [{ translateY: animSecciones[1].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }}>
            <View style={s.seccion}>
              <View style={s.seccionHeaderRow}>
                <LinearGradient colors={['#F59E0B', '#D97706']} style={s.seccionIconWrap}>
                  <Text style={s.seccionIcono}>🔔</Text>
                </LinearGradient>
                <Text style={s.seccionTitulo}>{t.notificaciones}</Text>
              </View>
              <View style={s.filaSwitch}>
                <Text style={s.filaLabel}>{t.recordatoriosMeditacion}</Text>
                <Switch
                  value={notis}
                  onValueChange={setNotis}
                  trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(147,51,234,0.5)' }}
                  thumbColor={notis ? '#9333EA' : '#555'}
                />
              </View>
            </View>
          </Animated.View>

          {/* Tema */}
          <Animated.View style={{
            opacity: animSecciones[2],
            transform: [{ translateY: animSecciones[2].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }}>
            <View style={s.seccion}>
              <View style={s.seccionHeaderRow}>
                <LinearGradient colors={['#EC4899', '#BE185D']} style={s.seccionIconWrap}>
                  <Text style={s.seccionIcono}>🎨</Text>
                </LinearGradient>
                <Text style={s.seccionTitulo}>{t.tema}</Text>
              </View>
              <View style={s.temaRow}>
                <View style={s.temaIndicator} />
                <Text style={s.info}>{t.oscuro}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Acerca de */}
          <Animated.View style={{
            opacity: animSecciones[3],
            transform: [{ translateY: animSecciones[3].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }}>
            <View style={s.seccion}>
              <View style={s.seccionHeaderRow}>
                <LinearGradient colors={['#10B981', '#059669']} style={s.seccionIconWrap}>
                  <Text style={s.seccionIcono}>ℹ️</Text>
                </LinearGradient>
                <Text style={s.seccionTitulo}>{t.acercaDe}</Text>
              </View>
              <Text style={s.info}>{t.versionApp}</Text>
              <Text style={s.infoSub}>Made with 💜 by Modo Zen Team</Text>
            </View>
          </Animated.View>

          {/* Cerrar sesión */}
          <Animated.View style={{
            opacity: animSecciones[4],
            transform: [{ translateY: animSecciones[4].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }}>
            <TouchableOpacity style={s.logoutBtn} onPress={cerrarSesion} activeOpacity={0.8}>
              <LinearGradient
                colors={['rgba(239,68,68,0.15)', 'rgba(239,68,68,0.08)']}
                style={s.logoutGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={s.logoutEmoji}>👋</Text>
                <Text style={s.logoutTxt}>{t.cerrarSesion}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const s = StyleSheet.create({
  raiz: { flex: 1 },
  fondo: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 16 },
  backBtn: {
    marginBottom: 16, backgroundColor: 'rgba(147,51,234,0.15)', alignSelf: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(147,51,234,0.3)',
  },
  backTxt: {
    color: '#C084FC', fontSize: 15, fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  titulo: {
    fontSize: 28, fontWeight: '600', color: '#FFF', letterSpacing: 0.5,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  sub: {
    fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 4,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
  },
  contenido: { paddingHorizontal: 20, paddingBottom: 40 },
  seccion: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20,
    marginTop: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  seccionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  seccionIconWrap: {
    width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  seccionIcono: { fontSize: 18 },
  seccionTitulo: {
    fontSize: 17, fontWeight: '500', color: '#FFF',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  filaBtns: { flexDirection: 'row', gap: 10 },
  idiomaBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
  },
  idiomaBtnActivo: { backgroundColor: 'rgba(147,51,234,0.2)', borderColor: '#9333EA' },
  idiomaTxt: {
    fontSize: 15, color: 'rgba(255,255,255,0.45)',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir',
  },
  idiomaTxtActivo: { color: '#C084FC', fontWeight: '500' },
  filaSwitch: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filaLabel: {
    fontSize: 14, color: 'rgba(255,255,255,0.55)', flex: 1,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir',
  },
  temaRow: { flexDirection: 'row', alignItems: 'center' },
  temaIndicator: {
    width: 12, height: 12, borderRadius: 6, backgroundColor: '#9333EA', marginRight: 10,
    shadowColor: '#9333EA', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 6,
  },
  info: {
    fontSize: 14, color: 'rgba(255,255,255,0.4)',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
  },
  infoSub: {
    fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 6,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
  },
  logoutBtn: { marginTop: 28, borderRadius: 18, overflow: 'hidden' },
  logoutGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 18, borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
  },
  logoutEmoji: { fontSize: 20, marginRight: 10 },
  logoutTxt: {
    fontSize: 16, fontWeight: '500', color: '#EF4444',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
});

export default AjustesScreen;
