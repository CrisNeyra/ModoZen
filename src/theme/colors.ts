// ============================================================
// Modo Zen - Paleta de colores púrpura / violeta
// Este archivo define todos los colores de la aplicación.
// Tonos púrpuras y violetas para una experiencia zen y moderna.
// ============================================================

export const colores = {
  // --- Colores principales ---
  primario: '#9333EA',         // Púrpura vibrante (botones, acentos)
  primarioOscuro: '#7C22CE',   // Púrpura intenso (hover, activos)
  primarioClaro: '#C084FC',    // Violeta suave / lavanda

  // --- Colores secundarios ---
  secundario: '#E8D5F5',       // Lavanda claro
  secundarioOscuro: '#6B6B6B', // Gris medio oscuro
  secundarioClaro: '#F3ECF9',  // Lila muy claro

  // --- Colores de acento ---
  acento: '#8C8C8C',           // Gris neutro
  acentoOscuro: '#5A5A5A',    // Gris oscuro elegante
  acentoClaro: '#B8B8B8',     // Gris claro

  // --- Fondos ---
  fondo: '#F8F4FB',            // Blanco lavanda (fondo general)
  fondoOscuro: '#0F0F23',     // Fondo oscuro profundo
  tarjeta: '#FFFFFF',          // Blanco puro (cards)
  fondoCard: '#1A1A2E',       // Fondo de tarjetas oscuro
  fondoCardSecundario: '#16213E', // Fondo secundario oscuro

  // --- Texto ---
  textoPrincipal: '#3A3A3A',  // Gris oscuro profundo (texto principal)
  textoSecundario: '#6B6B6B', // Gris medio (texto secundario)
  textoClaro: '#9E9E9E',      // Gris claro (placeholders, hints)
  textoSobrePrimario: '#FFFFFF', // Blanco (texto sobre botones púrpuras)

  // --- Estados ---
  exito: '#10B981',            // Verde esmeralda (éxito)
  advertencia: '#F59E0B',      // Ámbar dorado (advertencia)
  error: '#EF4444',            // Rojo suave (error)

  // --- Otros ---
  borde: '#DDD5E8',            // Borde sutil lavanda
  sombra: 'rgba(58, 58, 58, 0.1)',  // Sombra suave
  overlay: 'rgba(58, 58, 58, 0.5)', // Overlay para modales

  // --- Nuevos colores para polish ---
  dorado: '#FFD700',
  cian: '#06B6D4',
  rosa: '#EC4899',
  indigo: '#6366F1',
};

// Gradientes para efectos visuales
export const gradientes = {
  zen: ['#C084FC', '#9333EA', '#7C22CE'],       // Gradiente púrpura zen
  atardecer: ['#F59E0B', '#9333EA', '#7C22CE'], // Gradiente atardecer púrpura
  oceano: ['#06B6D4', '#6366F1', '#9333EA'],    // Gradiente océano
  noche: ['#0F0F23', '#1A1A2E', '#16213E'],     // Gradiente nocturno
  aurora: ['#EC4899', '#9333EA', '#6366F1'],     // Gradiente aurora
  bosque: ['#10B981', '#059669', '#047857'],     // Gradiente bosque
};

// Alias de compatibilidad (para no romper imports existentes)
export const colors = {
  primary: colores.primario,
  primaryDark: colores.primarioOscuro,
  primaryLight: colores.primarioClaro,
  secondary: colores.secundario,
  secondaryDark: colores.secundarioOscuro,
  secondaryLight: colores.secundarioClaro,
  accent: colores.acento,
  accentDark: colores.acentoOscuro,
  accentLight: colores.acentoClaro,
  background: colores.fondo,
  backgroundDark: colores.fondoOscuro,
  card: colores.tarjeta,
  cardDark: colores.fondoCard,
  cardSecondary: colores.fondoCardSecundario,
  textPrimary: colores.textoPrincipal,
  textSecondary: colores.textoSecundario,
  textLight: colores.textoClaro,
  textOnPrimary: colores.textoSobrePrimario,
  success: colores.exito,
  warning: colores.advertencia,
  error: colores.error,
  border: colores.borde,
  shadow: colores.sombra,
  overlay: colores.overlay,
  gold: colores.dorado,
  cyan: colores.cian,
  pink: colores.rosa,
  indigo: colores.indigo,
};

export default colors;

export type Tema = {
  fondo: string
  fondoOscuro: string
  tarjeta: string
  fondoCard: string
  fondoCardSecundario: string
  textoPrincipal: string
  textoSecundario: string
  textoClaro: string
  textoSobrePrimario: string
  primario: string
  primarioOscuro: string
  primarioClaro: string
  secundario: string
  secundarioOscuro: string
  secundarioClaro: string
  acento: string
  acentoOscuro: string
  acentoClaro: string
  borde: string
  sombra: string
  overlay: string
  exito: string
  advertencia: string
  error: string
  dorado: string
  cian: string
  rosa: string
  indigo: string
  fondoGradiente: string[]
}

export const temaOscuro: Tema = {
  fondo: '#0F0F23',
  fondoOscuro: '#0A0A1A',
  tarjeta: '#1A1A2E',
  fondoCard: '#1A1A2E',
  fondoCardSecundario: '#16213E',
  textoPrincipal: '#FFFFFF',
  textoSecundario: 'rgba(255,255,255,0.7)',
  textoClaro: 'rgba(255,255,255,0.45)',
  textoSobrePrimario: '#FFFFFF',
  primario: '#9333EA',
  primarioOscuro: '#7C22CE',
  primarioClaro: '#C084FC',
  secundario: '#E8D5F5',
  secundarioOscuro: '#6B6B6B',
  secundarioClaro: '#F3ECF9',
  acento: '#8C8C8C',
  acentoOscuro: '#5A5A5A',
  acentoClaro: '#B8B8B8',
  borde: 'rgba(255,255,255,0.12)',
  sombra: 'rgba(0,0,0,0.3)',
  overlay: 'rgba(0,0,0,0.6)',
  exito: '#10B981',
  advertencia: '#F59E0B',
  error: '#EF4444',
  dorado: '#FFD700',
  cian: '#06B6D4',
  rosa: '#EC4899',
  indigo: '#6366F1',
  fondoGradiente: ['#0F0F23', '#1A1A2E', '#16213E'],
}

export const temaClaro: Tema = {
  fondo: '#F8F4FB',
  fondoOscuro: '#EDE4F5',
  tarjeta: '#FFFFFF',
  fondoCard: '#FFFFFF',
  fondoCardSecundario: '#F3ECF9',
  textoPrincipal: '#3A3A3A',
  textoSecundario: 'rgba(58,58,58,0.65)',
  textoClaro: 'rgba(58,58,58,0.4)',
  textoSobrePrimario: '#FFFFFF',
  primario: '#9333EA',
  primarioOscuro: '#7C22CE',
  primarioClaro: '#C084FC',
  secundario: '#E8D5F5',
  secundarioOscuro: '#6B6B6B',
  secundarioClaro: '#F3ECF9',
  acento: '#8C8C8C',
  acentoOscuro: '#5A5A5A',
  acentoClaro: '#B8B8B8',
  borde: 'rgba(58,58,58,0.12)',
  sombra: 'rgba(58,58,58,0.08)',
  overlay: 'rgba(58,58,58,0.4)',
  exito: '#10B981',
  advertencia: '#F59E0B',
  error: '#EF4444',
  dorado: '#FFD700',
  cian: '#06B6D4',
  rosa: '#EC4899',
  indigo: '#6366F1',
  fondoGradiente: ['#F8F4FB', '#EDE4F5', '#E8D5F5'],
}
