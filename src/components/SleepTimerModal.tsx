import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { useIdioma } from '../context/LanguageContext';

interface SleepTimerModalProps {
  visible: boolean;
  onClose: () => void;
}

const OPCIONES = [15, 30, 45, 60];

const SleepTimerModal: React.FC<SleepTimerModalProps> = ({ visible, onClose }) => {
  const { idioma, t } = useIdioma();
  const { setSleepTimer, cancelarSleepTimer, sleepTimerRestante, sleepTimer } = useMusicPlayer();
  const [opcionActiva, setOpcionActiva] = useState<number | null>(null);

  const seleccionarTiempo = (min: number) => {
    setSleepTimer(min);
    setOpcionActiva(min);
    onClose();
  };

  const cancelar = () => {
    cancelarSleepTimer();
    setOpcionActiva(null);
    onClose();
  };

  const formatearTiempo = (seg: number): string => {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.modal}>
          <LinearGradient colors={['#1A1A2E', '#16213E']} style={s.modalContent}>
            <Text style={s.titulo}>
              {sleepTimer > 0
                ? `Sleep Timer: ${formatearTiempo(sleepTimerRestante)}`
                : 'Sleep Timer'}
            </Text>

            {sleepTimer > 0 && (
              <TouchableOpacity style={s.cancelarBtn} onPress={cancelar} activeOpacity={0.8}>
                <Text style={s.cancelarTxt}>Cancelar</Text>
              </TouchableOpacity>
            )}

            <View style={s.opciones}>
              {OPCIONES.map(min => (
                <TouchableOpacity
                  key={min}
                  style={[s.opcionBtn, opcionActiva === min && s.opcionBtnActiva]}
                  onPress={() => seleccionarTiempo(min)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.opcionTxt, opcionActiva === min && s.opcionTxtActiva]}>
                    {min} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={s.cerrarBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={s.cerrarTxt}>Cerrar</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '80%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 24,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
    fontFamily: 'Roboto',
  },
  cancelarBtn: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    marginBottom: 20,
  },
  cancelarTxt: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  opciones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  opcionBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minWidth: 80,
    alignItems: 'center',
  },
  opcionBtnActiva: {
    backgroundColor: 'rgba(147,51,234,0.3)',
    borderColor: '#9333EA',
  },
  opcionTxt: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  opcionTxtActiva: {
    color: '#E9D5FF',
  },
  cerrarBtn: {
    padding: 10,
  },
  cerrarTxt: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
});

export default SleepTimerModal;
