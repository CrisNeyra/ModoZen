import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ListaPantallas } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { useRatingPrompt } from '../context/RatingPromptContext';
import { pedirGuiaZen, type GuiaZenOutput } from '../services/guiaZenApi';

type ReflexionNavigation = NativeStackNavigationProp<ListaPantallas, 'Reflexion'>;

interface ReflexionScreenProps {
  navigation: ReflexionNavigation;
}

type ChipSugerencia = { id: string; label: string; mensajes: [string, string, string] };

/** Cada chip tiene 3 textos: al tocarlo de nuevo rotan en orden (1 → 2 → 3 → 1). */
const CHIPS_PESAN: ChipSugerencia[] = [
  {
    id: 'ansiedad',
    label: 'Ansiedad',
    mensajes: [
      'Hoy siento ansiedad fuerte, el pecho apretado y no puedo calmarme del todo.',
      'Me despierto con el cuerpo tenso y la mente ya corriendo; me cuesta bajar un cambio.',
      'Siento que algo malo va a pasar aunque no tenga claro el motivo; me cuesta respirar tranquilo/a.',
    ],
  },
  {
    id: 'tristeza',
    label: 'Tristeza',
    mensajes: [
      'Me siento triste y con un vacío adentro, como si nada me llenara.',
      'Lloro fácil o me dan ganas de llorar sin saber bien por qué; estoy sensible.',
      'Siento que perdí algo importante aunque no pueda ponerle nombre; me pesa el día.',
    ],
  },
  {
    id: 'agotamiento',
    label: 'Agotamiento',
    mensajes: [
      'Estoy reventado/a, sin energía, con la cabeza a mil y el cuerpo pesado.',
      'Duermo pero no descanso; llego al final del día hecho/a trizas.',
      'Tengo demasiadas responsabilidades y siento que ya no doy más.',
    ],
  },
  {
    id: 'soledad',
    label: 'Soledad',
    mensajes: [
      'Me siento solo/a aunque haya gente alrededor; no sé cómo explicarlo.',
      'Echo de menos conectar de verdad con alguien; las charlas me quedan cortas.',
      'Siento que nadie me entiende del todo y me cuesta pedir ayuda.',
    ],
  },
  {
    id: 'ira',
    label: 'Ira / bronca',
    mensajes: [
      'Tengo mucha bronca acumulada y me cuesta soltar; me siento atrapado/a.',
      'Me irrito por cosas chicas y después me da culpa; no reconozco mi propio humor.',
      'Siento injusticia por algo que pasó y la rabia no me deja en paz.',
    ],
  },
  {
    id: 'culpa',
    label: 'Culpa',
    mensajes: [
      'Me culpo mucho por decisiones pasadas; repito los mismos pensamientos en loop.',
      'Siento que defraudé a alguien o que no alcancé con lo que debía.',
      'Me da vergüenza admitir lo que siento; como si no tuviera derecho a estar mal.',
    ],
  },
  {
    id: 'miedo',
    label: 'Miedo',
    mensajes: [
      'Tengo miedo de lo que viene y me cuesta quedarme en el presente.',
      'Me angustia la incertidumbre; mi cabeza imagina mil escenarios malos.',
      'Me da temor fallar o quedar expuesto/a si digo lo que pienso.',
    ],
  },
  {
    id: 'confusion',
    label: 'Confusión',
    mensajes: [
      'No sé bien qué me pasa; estoy confundido/a y necesito ordenarme.',
      'Tengo la cabeza mezclada entre mil cosas y no encuentro prioridad.',
      'Siento que voy en piloto automático y perdí el rumbo de lo que quiero.',
    ],
  },
  {
    id: 'envidia',
    label: 'Comparación',
    mensajes: [
      'Me comparo todo el tiempo con otros y me siento menos; me consume.',
      'Veo redes o a la gente “bien” y me pega una sensación de no alcanzar.',
      'Me cuesta celebrar lo mío porque siempre miro lo que le falta a mi vida.',
    ],
  },
  {
    id: 'apatia',
    label: 'Apatía',
    mensajes: [
      'Estoy apático/a; nada me entusiasma y todo me da igual.',
      'Siento vacío y sin ganas de arrancar el día aunque no esté “triste”.',
      'Perdí el interés por cosas que antes me gustaban; estoy desconectado/a.',
    ],
  },
];

const CHIPS_BIEN: ChipSugerencia[] = [
  {
    id: 'gratitud',
    label: 'Gratitud',
    mensajes: [
      'Hoy quiero frenar un segundo y agradecer las cosas chicas que me sostienen.',
      'Siento gratitud por alguien o por un momento bueno que tuve recientemente.',
      'Noto que hay cosas que doy por sentado y hoy quiero nombrarlas con cariño.',
    ],
  },
  {
    id: 'paz',
    label: 'Paz / calma',
    mensajes: [
      'Estoy en un momento de calma y quiero profundizarlo, que no se me escape.',
      'Siento el cuerpo más liviano y la mente menos ruidosa; quiero cuidar esto.',
      'Hoy estuve bien y quiero un espacio que acompañe esta paz sin apurarme.',
    ],
  },
  {
    id: 'alegria',
    label: 'Alegría',
    mensajes: [
      'Me siento alegre y con energía buena; quiero celebrarlo sin culpa.',
      'Pasó algo lindo y quiero dejar que me llene un rato, sin minimizarlo.',
      'Siento ganas de reír, de moverme, de compartir; estoy en modo positivo.',
    ],
  },
  {
    id: 'esperanza',
    label: 'Esperanza',
    mensajes: [
      'Siento que algo puede mejorar aunque todavía no vea el camino completo.',
      'Tengo un atisbo de esperanza y quiero alimentarlo en vez de apagarlo.',
      'Quiero creer que este momento difícil no es para siempre; busco un ancla.',
    ],
  },
  {
    id: 'orgullo',
    label: 'Orgullo / logro',
    mensajes: [
      'Logré algo que me costó y quiero reconocerlo en vez de pasar de largo.',
      'Estoy orgulloso/a de un paso que di, aunque sea chico para los demás.',
      'Superé un miedo o un hábito y quiero afianzar ese logro con calma.',
    ],
  },
  {
    id: 'conexion',
    label: 'Conexión',
    mensajes: [
      'Me siento acompañado/a y querido/a; quiero disfrutar este vínculo.',
      'Tuve un momento de cercanía sincera con alguien y me hizo bien al alma.',
      'Siento amor o cariño fuerte hoy y quiero que el cuerpo lo registre también.',
    ],
  },
  {
    id: 'motivacion',
    label: 'Motivación',
    mensajes: [
      'Tengo ganas de encarar algo nuevo o de ordenar mi día con más claridad.',
      'Siento energía para avanzar en un proyecto que me importa.',
      'Quiero canalizar este impulso positivo sin quemarme; busco ritmo sano.',
    ],
  },
  {
    id: 'descanso',
    label: 'Descanso',
    mensajes: [
      'Por fin pude descansar un poco y el cuerpo me lo agradece; quiero más de esto.',
      'Siento que dormí mejor o que aflojé tensiones; quiero sostener el cuidado.',
      'Estoy en un día más tranquilo físicamente y quiero acompañarlo con algo suave.',
    ],
  },
];

const TODOS_CHIPS: ChipSugerencia[] = [...CHIPS_PESAN, ...CHIPS_BIEN];

/**
 * Mensajes "Para vos, ahora": 4 variantes por chip.
 * Rota por chip cada vez que el usuario vuelve a pedir guía.
 */
function construirMensajeParaVos(
  chip: ChipSugerencia,
  textoUsuario: string,
  variante: number,
): string {
  const foco = chip.label.toLowerCase();
  const contexto = textoUsuario.trim();

  const mensajes = [
    `Hoy lo que estás viviendo con ${foco} merece respeto y cuidado, no apuro. No estás exagerando ni fallando: estás registrando algo real adentro tuyo. Si podés, aflojá un poco los hombros y dejá que este momento te acompañe con menos exigencia. Paso a paso también es avanzar.`,
    `Gracias por poner en palabras lo que te pasa con ${foco}. Nombrarlo ya es un acto de valentía, porque no siempre es fácil mirarse con honestidad. No necesitás resolver todo ahora: con darte un rato de presencia y respiración suave ya estás haciendo algo importante por vos.`,
    `Cuando aparece ${foco}, el cuerpo y la mente suelen pedir contención antes que respuestas perfectas. Podés tratarte con más ternura en este tramo, incluso si todavía hay ruido interno. Quedate con una idea simple: hoy no tenés que demostrar nada, solo cuidarte un poco mejor.`,
    `Lo que trajiste sobre ${foco} tiene sentido en tu historia y en este día puntual. Permitite bajar el juicio interno, aunque sea un poquito, y elegir un ritmo más amable para vos. Este ratito puede ser una pausa real para volver a tu centro con más calma.`,
  ];

  const extra =
    contexto.length > 0
      ? ` Punto de partida para vos: "${contexto.slice(0, 90)}${contexto.length > 90 ? '...' : ''}".`
      : '';

  return `${mensajes[variante % 4]}${extra}`;
}

const ReflexionScreen: React.FC<ReflexionScreenProps> = ({ navigation }) => {
  const { usuario } = useAuth();
  const { trackInteraction } = useRatingPrompt();
  const [mensaje, setMensaje] = useState('');
  const [resultado, setResultado] = useState<GuiaZenOutput | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  /** Próximo índice de mensaje (0–2) a usar en cada chip al tocarlo */
  const [rotacionChip, setRotacionChip] = useState<Record<string, number>>({});
  /** Chip elegido por última vez para personalizar "Para vos, ahora" */
  const [chipActivoId, setChipActivoId] = useState<string | null>(null);
  /** Próximo índice (0–3) de respuesta "Para vos, ahora" por chip */
  const [rotacionParaVos, setRotacionParaVos] = useState<Record<string, number>>({});

  const enviarReflexion = async (): Promise<void> => {
    const texto = mensaje.trim();
    if (texto.length < 3) {
      Alert.alert('Un pasito más', 'Contame al menos unas palabras para poder acompañarte.');
      return;
    }

    setCargando(true);
    setError(null);
    setResultado(null);
    setMostrarModal(true);

    try {
      const respuesta = await pedirGuiaZen({
        mensaje: texto,
        user_id: usuario?.id,
      });
      let respuestaFinal = respuesta;
      if (chipActivoId) {
        const chipActivo = TODOS_CHIPS.find(c => c.id === chipActivoId);
        if (chipActivo) {
          const i = rotacionParaVos[chipActivo.id] ?? 0;
          respuestaFinal = {
            ...respuesta,
            mensaje_empatico: construirMensajeParaVos(chipActivo, texto, i),
          };
          setRotacionParaVos(prev => ({ ...prev, [chipActivo.id]: (i + 1) % 4 }));
        }
      }
      setResultado(respuestaFinal);
      await trackInteraction('reflection_received');
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : 'No pudimos conectar con tu guía en este momento. Probemos de nuevo en un ratito.';
      setMostrarModal(false);
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  const aplicarChip = (chip: ChipSugerencia): void => {
    const i = rotacionChip[chip.id] ?? 0;
    setMensaje(chip.mensajes[i]);
    setChipActivoId(chip.id);
    setRotacionChip(prev => ({ ...prev, [chip.id]: (i + 1) % chip.mensajes.length }));
  };

  const cerrarModalResultado = (): void => {
    setMostrarModal(false);
    setResultado(null);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F0F23', '#1A1A2E', '#16213E']} style={StyleSheet.absoluteFill} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Guía Zen</Text>
        <Text style={styles.subtitle}>
          Contame con tus palabras qué te pasa: el Guía responde con un mensaje empático, pensado para tu estado de
          ánimo.
        </Text>

        <Text style={styles.chipsHint}>
          Tocá un estado: se rellena el texto base. Volvé a tocar el mismo chip para ver otra variante (3 por
          estado). En "Para vos, ahora" cada chip rota en 4 mensajes distintos.
        </Text>

        <Text style={styles.chipsSection}>Cuando pesa</Text>
        <View style={styles.chipsRow}>
          {CHIPS_PESAN.map(chip => (
            <TouchableOpacity
              key={chip.id}
              style={[styles.chip, styles.chipNeg]}
              activeOpacity={0.8}
              onPress={() => aplicarChip(chip)}
              disabled={cargando}
            >
              <Text style={styles.chipText}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.chipsSection}>Cuando está bien</Text>
        <View style={styles.chipsRow}>
          {CHIPS_BIEN.map(chip => (
            <TouchableOpacity
              key={chip.id}
              style={[styles.chip, styles.chipPos]}
              activeOpacity={0.8}
              onPress={() => aplicarChip(chip)}
              disabled={cargando}
            >
              <Text style={styles.chipText}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.inputLabel}>¿Cómo estás hoy?</Text>
          <TextInput
            value={mensaje}
            onChangeText={setMensaje}
            multiline
            maxLength={1200}
            editable={!cargando}
            placeholder="Ej.: qué sentís en el cuerpo, qué te pasó hoy, qué te preocupa… Cuanto más contexto, más personal puede ser la guía."
            placeholderTextColor="rgba(255,255,255,0.45)"
            style={styles.input}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{mensaje.trim().length}/1200</Text>

          <TouchableOpacity
            style={[styles.sendButton, cargando && styles.sendButtonDisabled]}
            activeOpacity={0.85}
            onPress={enviarReflexion}
            disabled={cargando}
          >
            <Text style={styles.sendButtonText}>
              {cargando ? 'Tu guía está preparando una respuesta...' : 'Recibir guía'}
            </Text>
          </TouchableOpacity>
        </View>

        {!cargando && error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>No pasa nada, intentemos de nuevo</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={mostrarModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!cargando && resultado) {
            cerrarModalResultado();
          }
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {cargando ? (
              <>
                <ActivityIndicator color="#C084FC" size="large" />
                <Text style={styles.modalLoadingText}>Respirando...</Text>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Para vos, ahora</Text>
                <Text style={styles.modalMessage}>{resultado?.mensaje_empatico}</Text>
                <TouchableOpacity style={styles.modalButton} onPress={cerrarModalResultado} activeOpacity={0.85}>
                  <Text style={styles.modalButtonText}>Entendido</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F23' },
  content: { paddingTop: Platform.OS === 'ios' ? 64 : 42, paddingHorizontal: 20, paddingBottom: 40 },
  backButton: { alignSelf: 'flex-start', marginBottom: 12 },
  backText: { color: '#C084FC', fontSize: 16, fontWeight: '600' },
  title: { color: '#FFFFFF', fontSize: 30, fontWeight: '800', marginBottom: 8 },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },
  chipsHint: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chipsSection: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  chipNeg: {
    backgroundColor: 'rgba(127,29,29,0.22)',
    borderColor: 'rgba(252,165,165,0.35)',
  },
  chipPos: {
    backgroundColor: 'rgba(22,101,52,0.28)',
    borderColor: 'rgba(134,239,172,0.4)',
  },
  chipText: { color: '#F5F3FF', fontSize: 13, fontWeight: '600' },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 16,
  },
  inputLabel: { color: '#E9D5FF', fontSize: 15, fontWeight: '700', marginBottom: 8 },
  input: {
    minHeight: 145,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(192,132,252,0.35)',
    backgroundColor: 'rgba(0,0,0,0.25)',
    color: '#FFFFFF',
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
  },
  charCount: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 14,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  sendButton: {
    borderRadius: 14,
    backgroundColor: '#9333EA',
    paddingVertical: 14,
    alignItems: 'center',
  },
  sendButtonDisabled: { opacity: 0.75 },
  sendButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  errorCard: {
    marginTop: 16,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(252,165,165,0.4)',
    backgroundColor: 'rgba(127,29,29,0.28)',
  },
  errorTitle: { color: '#FEE2E2', fontWeight: '700', fontSize: 14, marginBottom: 5 },
  errorText: { color: '#FECACA', fontSize: 13, lineHeight: 19 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  modalCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: '#141A2B',
  },
  modalLoadingText: { marginTop: 12, color: '#E9D5FF', fontSize: 15, textAlign: 'center' },
  modalTitle: {
    color: '#C084FC',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  modalMessage: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 25,
    marginBottom: 16,
  },
  modalButton: {
    borderRadius: 12,
    backgroundColor: '#9333EA',
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default ReflexionScreen;
