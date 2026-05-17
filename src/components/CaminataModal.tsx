import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface CaminataModalProps {
  visible: boolean;
  titulo: string;
  instrucciones: string;
  gradiente: [string, string];
  textoBoton: string;
  onClose: () => void;
}

const CaminataModal: React.FC<CaminataModalProps> = ({
  visible,
  titulo,
  instrucciones,
  gradiente,
  textoBoton,
  onClose,
}) => {
  const lineas = instrucciones.split('\n');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.modal}>
          <LinearGradient colors={['#1A1A2E', '#16213E']} style={s.modalContent}>
            <LinearGradient colors={gradiente} style={s.headerGrad}>
              <Text style={s.titulo}>{titulo}</Text>
            </LinearGradient>

            <ScrollView style={s.instruccionesWrap} showsVerticalScrollIndicator={false}>
              {lineas.map((linea, i) => (
                <View key={i} style={s.instruccionItem}>
                  <View style={s.instruccionPunto} />
                  <Text style={s.instruccionTxt}>{linea}</Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={s.btn} onPress={onClose} activeOpacity={0.85}>
              <LinearGradient colors={gradiente} style={s.btnGrad}>
                <Text style={s.btnTxt}>{textoBoton}</Text>
              </LinearGradient>
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
    paddingHorizontal: 20,
  },
  modal: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    maxHeight: '70%',
  },
  modalContent: {
    padding: 0,
  },
  headerGrad: {
    padding: 20,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  instruccionesWrap: {
    padding: 20,
    maxHeight: 300,
  },
  instruccionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  instruccionPunto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9333EA',
    marginTop: 6,
    marginRight: 12,
    flexShrink: 0,
  },
  instruccionTxt: {
    flex: 1,
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 22,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Light',
  },
  btn: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  btnGrad: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnTxt: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
});

export default CaminataModal;
