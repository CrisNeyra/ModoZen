import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Animated,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ListaPantallas } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { useRatingPrompt } from '../context/RatingPromptContext';
import { useTheme } from '../context/ThemeContext';
import { pedirGuiaZen, type GuiaZenOutput } from '../services/guiaZenApi';

const { width: ANCHO } = Dimensions.get('window');
type ReflexionNavigation = NativeStackNavigationProp<ListaPantallas, 'Reflexion'>;

interface ReflexionScreenProps {
  navigation: ReflexionNavigation;
}

type ChipSugerencia = { id: string; label: string; mensajes: [string, string, string] };

const CHIPS_PESAN: ChipSugerencia[] = [
  { id: 'ansiedad', label: 'Ansiedad', mensajes: ['Hoy siento ansiedad fuerte, el pecho apretado y no puedo calmarme del todo.', 'Me despierto con el cuerpo tenso y la mente ya corriendo; me cuesta bajar un cambio.', 'Siento que algo malo va a pasar aunque no tenga claro el motivo; me cuesta respirar tranquilo/a.'] },
  { id: 'tristeza', label: 'Tristeza', mensajes: ['Me siento triste y con un vacío adentro, como si nada me llenara.', 'Lloro fácil o me dan ganas de llorar sin saber bien por qué; estoy sensible.', 'Siento que perdí algo importante aunque no pueda ponerle nombre; me pesa el día.'] },
  { id: 'agotamiento', label: 'Agotamiento', mensajes: ['Estoy reventado/a, sin energía, con la cabeza a mil y el cuerpo pesado.', 'Duermo pero no descanso; llego al final del día hecho/a trizas.', 'Tengo demasiadas responsabilidades y siento que ya no doy más.'] },
  { id: 'soledad', label: 'Soledad', mensajes: ['Me siento solo/a aunque haya gente alrededor; no sé cómo explicarlo.', 'Echo de menos conectar de verdad con alguien; las charlas me quedan cortas.', 'Siento que nadie me entiende del todo y me cuesta pedir ayuda.'] },
  { id: 'ira', label: 'Ira / bronca', mensajes: ['Tengo mucha bronca acumulada y me cuesta soltar; me siento atrapado/a.', 'Me irrito por cosas chicas y después me da culpa; no reconozco mi propio humor.', 'Siento injusticia por algo que pasó y la rabia no me deja en paz.'] },
  { id: 'culpa', label: 'Culpa', mensajes: ['Me culpo mucho por decisiones pasadas; repito los mismos pensamientos en loop.', 'Siento que defraudé a alguien o que no alcancé con lo que debía.', 'Me da vergüenza admitir lo que siento; como si no tuviera derecho a estar mal.'] },
  { id: 'miedo', label: 'Miedo', mensajes: ['Tengo miedo de lo que viene y me cuesta quedarme en el presente.', 'Me angustia la incertidumbre; mi cabeza imagina mil escenarios malos.', 'Me da temor fallar o quedar expuesto/a si digo lo que pienso.'] },
  { id: 'confusion', label: 'Confusión', mensajes: ['No sé bien qué me pasa; estoy confundido/a y necesito ordenarme.', 'Tengo la cabeza mezclada entre mil cosas y no encuentro prioridad.', 'Siento que voy en piloto automático y perdí el rumbo de lo que quiero.'] },
  { id: 'envidia', label: 'Comparación', mensajes: ['Me comparo todo el tiempo con otros y me siento menos; me consume.', 'Veo redes o a la gente "bien" y me pega una sensación de no alcanzar.', 'Me cuesta celebrar lo mío porque siempre miro lo que le falta a mi vida.'] },
  { id: 'apatia', label: 'Apatía', mensajes: ['Estoy apático/a; nada me entusiasma y todo me da igual.', 'Siento vacío y sin ganas de arrancar el día aunque no esté "triste".', 'Perdí el interés por cosas que antes me gustaban; estoy desconectado/a.'] },
];

const CHIPS_BIEN: ChipSugerencia[] = [
  { id: 'gratitud', label: 'Gratitud', mensajes: ['Hoy quiero frenar un segundo y agradecer las cosas chicas que me sostienen.', 'Siento gratitud por alguien o por un momento bueno que tuve recientemente.', 'Noto que hay cosas que doy por sentado y hoy quiero nombrarlas con cariño.'] },
  { id: 'paz', label: 'Paz / calma', mensajes: ['Estoy en un momento de calma y quiero profundizarlo, que no se me escape.', 'Siento el cuerpo más liviano y la mente menos ruidosa; quiero cuidar esto.', 'Hoy estuve bien y quiero un espacio que acompañe esta paz sin apurarme.'] },
  { id: 'alegria', label: 'Alegría', mensajes: ['Me siento alegre y con energía buena; quiero celebrarlo sin culpa.', 'Pasó algo lindo y quiero dejar que me llene un rato, sin minimizarlo.', 'Siento ganas de reír, de moverme, de compartir; estoy en modo positivo.'] },
  { id: 'esperanza', label: 'Esperanza', mensajes: ['Siento que algo puede mejorar aunque todavía no vea el camino completo.', 'Tengo un atisbo de esperanza y quiero alimentarlo en vez de apagarlo.', 'Quiero creer que este momento difícil no es para siempre; busco un ancla.'] },
  { id: 'orgullo', label: 'Orgullo / logro', mensajes: ['Logré algo que me costó y quiero reconocerlo en vez de pasar de largo.', 'Estoy orgulloso/a de un paso que di, aunque sea chico para los demás.', 'Superé un miedo o un hábito y quiero afianzar ese logro con calma.'] },
  { id: 'conexion', label: 'Conexión', mensajes: ['Me siento acompañado/a y querido/a; quiero disfrutar este vínculo.', 'Tuve un momento de cercanía sincera con alguien y me hizo bien al alma.', 'Siento amor o cariño fuerte hoy y quiero que el cuerpo lo registre también.'] },
  { id: 'motivacion', label: 'Motivación', mensajes: ['Tengo ganas de encarar algo nuevo o de ordenar mi día con más claridad.', 'Siento energía para avanzar en un proyecto que me importa.', 'Quiero canalizar este impulso positivo sin quemarme; busco ritmo sano.'] },
  { id: 'descanso', label: 'Descanso', mensajes: ['Por fin pude descansar un poco y el cuerpo me lo agradece; quiero más de esto.', 'Siento que dormí mejor o que aflojé tensiones; quiero sostener el cuidado.', 'Estoy en un día más tranquilo físicamente y quiero acompañarlo con algo suave.'] },
];

const TODOS_CHIPS: ChipSugerencia[] = [...CHIPS_PESAN, ...CHIPS_BIEN];

function construirMensajeParaVos(chip: ChipSugerencia, textoUsuario: string, variante: number): string {
  const foco = chip.label.toLowerCase();
  const contexto = textoUsuario.trim();
  const mensajes = [
    `Hoy lo que estás viviendo con ${foco} merece respeto y cuidado, no apuro. No estás exagerando ni fallando: estás registrando algo real adentro tuyo. Si podés, aflojá un poco los hombros y dejá que este momento te acompañe con menos exigencia. Paso a paso también es avanzar.`,
    `Gracias por poner en palabras lo que te pasa con ${foco}. Nombrarlo ya es un acto de valentía, porque no siempre es fácil mirarse con honestidad. No necesitás resolver todo ahora: con darte un rato de presencia y respiración suave ya estás haciendo algo importante por vos.`,
    `Cuando aparece ${foco}, el cuerpo y la mente suelen pedir contención antes que respuestas perfectas. Podés tratarte con más ternura en este tramo, incluso si todavía hay ruido interno. Quedate con una idea simple: hoy no tenés que demostrar nada, solo cuidarte un poco mejor.`,
    `Lo que trajiste sobre ${foco} tiene sentido en tu historia y en este día puntual. Permitite bajar el juicio interno, aunque sea un poquito, y elegir un ritmo más amable para vos. Este ratito puede ser una pausa real para volver a tu centro con más calma.`,
  ];
  const extra = contexto.length > 0
    ? ` Punto de partida para vos: "${contexto.slice(0, 90)}${contexto.length > 90 ? '...' : ''}".`
    : '';
  return `${mensajes[variante % 4]}${extra}`;
}

const PAGINAS = [
  { id: 0, titulo: '¿Cómo te sentís?', subtitulo: 'Elegí un estado que resuene con tu momento', icono: '💭' },
  { id: 1, titulo: 'Escribí tu reflexión', subtitulo: 'Contame con tus palabras qué te pasa', icono: '✍️' },
];

const ReflexionScreen: React.FC<ReflexionScreenProps> = ({ navigation }) => {
  const { theme, themeMode } = useTheme();
  const { usuario } = useAuth();
  const esOscuro = themeMode === 'dark';
  const { trackInteraction } = useRatingPrompt();
  const [mensaje, setMensaje] = useState('');
  const [resultado, setResultado] = useState<GuiaZenOutput | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [paginaActual, setPaginaActual] = useState(0);
  const [rotacionChip, setRotacionChip] = useState<Record<string, number>>({});
  const [chipActivoId, setChipActivoId] = useState<string | null>(null);
  const [rotacionParaVos, setRotacionParaVos] = useState<Record<string, number>>({});

  const hScrollRef = useRef<ScrollView>(null);
  const animDot = useRef(new Animated.Value(0)).current;

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
      const respuesta = await pedirGuiaZen({ mensaje: texto, user_id: usuario?.id });
      let respuestaFinal = respuesta;
      if (chipActivoId) {
        const chipActivo = TODOS_CHIPS.find(c => c.id === chipActivoId);
        if (chipActivo) {
          const i = rotacionParaVos[chipActivo.id] ?? 0;
          respuestaFinal = { ...respuesta, mensaje_empatico: construirMensajeParaVos(chipActivo, texto, i) };
          setRotacionParaVos(prev => ({ ...prev, [chipActivo.id]: (i + 1) % 4 }));
        }
      }
      setResultado(respuestaFinal);
      await trackInteraction('reflection_received');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No pudimos conectar con tu guía en este momento. Probemos de nuevo en un ratito.';
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

  const onHScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / ANCHO);
    if (page !== paginaActual) setPaginaActual(page);
    animDot.setValue(e.nativeEvent.contentOffset.x / ANCHO);
  }, [paginaActual, animDot]);

  const s = crearEstilos(theme, esOscuro);

  return (
    <View style={s.container}>
      <LinearGradient colors={theme.fondoGradiente} style={StyleSheet.absoluteFill} />

      {/* Header fijo */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton}>
          <Text style={s.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={s.title}>Guía Zen</Text>
        <Text style={s.pageIndicator}>
          {PAGINAS[paginaActual]?.icono} Paso {paginaActual + 1} de {PAGINAS.length}
        </Text>
      </View>

      {/* Carrusel horizontal */}
      <ScrollView
        ref={hScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onHScroll}
        scrollEventThrottle={16}
        style={s.carrusel}
      >
        {/* ═══ PÁGINA 1: Chips de emociones ═══ */}
        <View style={{ width: ANCHO }}>
          <ScrollView contentContainerStyle={s.pageContent} keyboardShouldPersistTaps="handled">
            <Text style={s.title2}>{PAGINAS[0].titulo}</Text>
            <Text style={s.subtitle}>{PAGINAS[0].subtitulo}</Text>

            <Text style={s.chipsHint}>Tocá un estado: se rellena el texto base. Volvé a tocar el mismo chip para ver otra variante.</Text>

            <Text style={s.chipsSection}>Cuando pesa</Text>
            <View style={s.chipsRow}>
              {CHIPS_PESAN.map(chip => (
                <TouchableOpacity key={chip.id} style={[s.chip, s.chipNeg]} activeOpacity={0.8}
                  onPress={() => aplicarChip(chip)} disabled={cargando}>
                  <Text style={s.chipText}>{chip.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.chipsSection}>Cuando está bien</Text>
            <View style={s.chipsRow}>
              {CHIPS_BIEN.map(chip => (
                <TouchableOpacity key={chip.id} style={[s.chip, s.chipPos]} activeOpacity={0.8}
                  onPress={() => aplicarChip(chip)} disabled={cargando}>
                  <Text style={s.chipText}>{chip.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={s.sigBtn} onPress={() => hScrollRef.current?.scrollTo({ x: ANCHO, animated: true })} activeOpacity={0.85}>
              <LinearGradient colors={[theme.primario, theme.primarioOscuro]} style={s.sigGrad}>
                <Text style={s.sigTxt}>Siguiente →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ═══ PÁGINA 2: TextInput + enviar ═══ */}
        <View style={{ width: ANCHO }}>
          <ScrollView contentContainerStyle={s.pageContent} keyboardShouldPersistTaps="handled">
            <Text style={s.title2}>{PAGINAS[1].titulo}</Text>
            <Text style={s.subtitle}>{PAGINAS[1].subtitulo}</Text>

            {!mostrarModal && error && (
              <View style={s.errorCard}>
                <Text style={s.errorTitle}>No pasa nada, intentemos de nuevo</Text>
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <View style={s.card}>
              <Text style={s.inputLabel}>¿Cómo estás hoy?</Text>
              <TextInput
                value={mensaje}
                onChangeText={setMensaje}
                multiline
                maxLength={1200}
                editable={!cargando}
                placeholder="Ej.: qué sentís en el cuerpo, qué te pasó hoy, qué te preocupa…"
                placeholderTextColor={theme.textoClaro}
                style={s.input}
                textAlignVertical="top"
              />
              <Text style={s.charCount}>{mensaje.trim().length}/1200</Text>

              <TouchableOpacity
                style={[s.sendButton, cargando && s.sendButtonDisabled]}
                activeOpacity={0.85}
                onPress={enviarReflexion}
                disabled={cargando}
              >
                <Text style={s.sendButtonText}>
                  {cargando ? 'Tu guía está preparando una respuesta...' : 'Recibir guía'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.atrasBtn} onPress={() => hScrollRef.current?.scrollTo({ x: 0, animated: true })} activeOpacity={0.8}>
              <Text style={[s.atrasTxt, { color: theme.textoSecundario }]}>← Paso anterior</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Indicador de progreso (puntos) */}
      <View style={s.dotsRow}>
        {[0, 1].map(i => (
          <TouchableOpacity key={i} onPress={() => hScrollRef.current?.scrollTo({ x: ANCHO * i, animated: true })} activeOpacity={0.9}>
            <Animated.View style={[
              s.dot,
              {
                backgroundColor: animDot.interpolate({
                  inputRange: [0, 1],
                  outputRange: i === 0 ? [theme.primarioClaro, 'rgba(255,255,255,0.2)'] : ['rgba(255,255,255,0.2)', theme.primarioClaro],
                }),
                transform: [{
                  scale: animDot.interpolate({
                    inputRange: [0, 1],
                    outputRange: i === 0 ? [1.3, 0.8] : [0.8, 1.3],
                  }),
                }],
              },
            ]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal de resultado (se mantiene igual) */}
      <Modal visible={mostrarModal} transparent animationType="fade"
        onRequestClose={() => { if (!cargando && resultado) cerrarModalResultado(); }}>
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            {cargando ? (
              <>
                <ActivityIndicator color={theme.primarioClaro} size="large" />
                <Text style={s.modalLoadingText}>Respirando...</Text>
              </>
            ) : (
              <>
                <Text style={s.modalTitle}>Para vos, ahora</Text>
                <Text style={s.modalMessage}>{resultado?.mensaje_empatico}</Text>
                <TouchableOpacity style={s.modalButton} onPress={cerrarModalResultado} activeOpacity={0.85}>
                  <Text style={s.modalButtonText}>Entendido</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const crearEstilos = (theme: any, esOscuro: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.fondo },
  header: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 20, paddingBottom: 12 },
  backButton: { alignSelf: 'flex-start', marginBottom: 8 },
  backText: { color: theme.primarioClaro, fontSize: 16, fontWeight: '600' },
  title: { color: theme.textoPrincipal, fontSize: 30, fontWeight: '800', marginBottom: 4 },
  pageIndicator: { color: theme.textoClaro, fontSize: 13, fontWeight: '500' },
  carrusel: { flex: 1 },
  pageContent: { paddingHorizontal: 20, paddingBottom: 40 },
  title2: { color: theme.textoPrincipal, fontSize: 22, fontWeight: '700', marginBottom: 4, marginTop: 4 },
  subtitle: { color: theme.textoSecundario, fontSize: 14, lineHeight: 21, marginBottom: 16 },
  chipsHint: { color: theme.textoClaro, fontSize: 12, marginBottom: 12 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  chipsSection: { color: theme.textoSecundario, fontSize: 13, fontWeight: '700', marginTop: 4, marginBottom: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, marginRight: 8, marginBottom: 8 },
  chipNeg: { backgroundColor: 'rgba(127,29,29,0.22)', borderColor: 'rgba(252,165,165,0.35)' },
  chipPos: { backgroundColor: 'rgba(22,101,52,0.28)', borderColor: 'rgba(134,239,172,0.4)' },
  chipText: { color: '#F5F3FF', fontSize: 13, fontWeight: '600' },
  sigBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8, elevation: 4, shadowColor: theme.primario, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  sigGrad: { paddingVertical: 14, alignItems: 'center' },
  sigTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  atrasBtn: { marginTop: 16, padding: 12, alignItems: 'center' },
  atrasTxt: { fontSize: 14, fontWeight: '500' },
  card: {
    borderRadius: 20, borderWidth: 1, borderColor: theme.borde, backgroundColor: theme.fondoCard, padding: 16,
  },
  inputLabel: { color: theme.primarioClaro, fontSize: 15, fontWeight: '700', marginBottom: 8 },
  input: {
    minHeight: 145, borderRadius: 14, borderWidth: 1, borderColor: theme.borde,
    backgroundColor: esOscuro ? 'rgba(0,0,0,0.25)' : 'rgba(147,51,234,0.05)',
    color: theme.textoPrincipal, padding: 14, fontSize: 15, lineHeight: 22,
  },
  charCount: { alignSelf: 'flex-end', marginTop: 8, marginBottom: 14, color: theme.textoClaro, fontSize: 12 },
  sendButton: { borderRadius: 14, backgroundColor: theme.primario, paddingVertical: 14, alignItems: 'center' },
  sendButtonDisabled: { opacity: 0.75 },
  sendButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  errorCard: {
    marginTop: 16, marginBottom: 16, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(252,165,165,0.4)', backgroundColor: 'rgba(127,29,29,0.28)',
  },
  errorTitle: { color: '#FEE2E2', fontWeight: '700', fontSize: 14, marginBottom: 5 },
  errorText: { color: '#FECACA', fontSize: 13, lineHeight: 19 },
  dotsRow: {
    position: 'absolute', bottom: Platform.OS === 'ios' ? 40 : 24,
    alignSelf: 'center', flexDirection: 'row', gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', paddingHorizontal: 22 },
  modalCard: { borderRadius: 18, padding: 18, borderWidth: 1, borderColor: theme.borde, backgroundColor: theme.fondoCard },
  modalLoadingText: { marginTop: 12, color: theme.primarioClaro, fontSize: 15, textAlign: 'center' },
  modalTitle: { color: theme.primarioClaro, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  modalMessage: { color: theme.textoPrincipal, fontSize: 16, lineHeight: 25, marginBottom: 16 },
  modalButton: { borderRadius: 12, backgroundColor: theme.primario, paddingVertical: 12, alignItems: 'center' },
  modalButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});

export default ReflexionScreen;
