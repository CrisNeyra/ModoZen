// ============================================================
// MiniMusicPlayer.tsx — Reproductor flotante global
// Se muestra sobre todas las pantallas cuando hay música sonando.
// Solo visible si reproduciendo === true.
// ============================================================

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useMusicPlayer } from '../context/MusicPlayerContext';

const MiniMusicPlayer: React.FC = () => {
  const { pista, reproduciendo, toggleReproduccion, siguiente, anterior, nombrePista } = useMusicPlayer();

  if (!reproduciendo) return null;

  return (
    <View style={s.floatingWrap}>
      <LinearGradient
        colors={['rgba(15,15,35,0.95)', 'rgba(147,51,234,0.25)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={s.card}
      >
        <Text style={s.icono}>{pista.icono}</Text>
        <View style={s.info}>
          <Text style={s.nombre} numberOfLines={1}>{nombrePista(pista)}</Text>
          <Text style={s.sub}>🎵 Modo Zen</Text>
        </View>
        <View style={s.controles}>
          <TouchableOpacity onPress={anterior} style={s.btn} activeOpacity={0.6}>
            <Text style={s.btnTxt}>⏮</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleReproduccion} style={s.playBtn} activeOpacity={0.7}>
            <LinearGradient colors={['#9333EA', '#7C3AED']} style={s.playGrad}>
              <Text style={s.playTxt}>⏸</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={siguiente} style={s.btn} activeOpacity={0.6}>
            <Text style={s.btnTxt}>⏭</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const s = StyleSheet.create({
  floatingWrap: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    zIndex: 999,
    elevation: 20,
  },
  card: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 18,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: 'rgba(147,51,234,0.35)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12,
  },
  icono: { fontSize: 24, marginRight: 10 },
  info: { flex: 1 },
  nombre: {
    fontSize: 13, fontWeight: '600', color: '#FFF',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  sub: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 1 },
  controles: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  btn: { padding: 6 },
  btnTxt: { fontSize: 16, color: 'rgba(255,255,255,0.7)' },
  playBtn: { borderRadius: 16, overflow: 'hidden' },
  playGrad: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  playTxt: { fontSize: 14, color: '#FFF' },
});

export default MiniMusicPlayer;
