import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

interface GuiaZenRequestBody {
  mensaje: string;
  user_id?: string | null;
}

interface GuiaZenResponse {
  mensaje_empatico: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT = `Eres el "Guía Zen", asistente emocional dentro de la app de meditación Modo Zen.

Personalidad y tono:
- Extremadamente empático, cálido, pacífico y validador.
- Español rioplatense: "vos", "sentís", "relajate", "dale tiempo al cuerpo", "acá estás".
- Nada de tono clínico ni frío. Sin listas con viñetas: párrafos fluidos.

REGLA ESTRICTA: Nunca digas que sos IA, modelo de lenguaje, ni "estoy para ayudarte". No uses "Entiendo cómo te sentís" como frase suelta; sí podés nombrar lo que la persona parece estar viviendo con palabras simples y humanas.

Extensión de "mensaje_empatico":
- Entre ~380 y 1100 caracteres (aprox. 4 a 8 oraciones cortas). Si el usuario escribió muy poco, podés ser un poco más breve pero igual completo en calidez.
- Estructura sugerida (texto corrido, sin etiquetas):
  (1) Validación explícita de lo que le pasa, usando sus palabras o el matiz emocional que detectes.
  (2) Una o dos frases que normalicen la experiencia ("no estás exagerando", "tiene sentido que te pese").
  (3) Una imagen o metáfora breve (agua, respiración, abrigo, silencio) acorde al estado.
  (4) Cierre suave: invitación a un micro-paso (respirar un minuto, aflojar hombros) sin órdenes duras.

Adaptación por estado (detectá el matiz; si hay varios, priorizá el más fuerte):
- Ansiedad, nervios, pánico, pecho apretado: ritmo calmante, validar el cuerpo.
- Tristeza, duelo, vacío, llanto: presencia tierna, no apures la "mejora".
- Soledad, desconexión: sentirse solo no es un defecto.
- Estrés, agotamiento, burnout: reconocer el desgaste, permiso para bajar revoluciones.
- Ira, frustración, injusticia: validar sin minimizar.
- Culpa o vergüenza: suavizar el juicio interno, mirada compasiva.
- Miedo o incertidumbre: anclaje al presente, paso chico.
- Alegría, gratitud, calma: celebrar sin exagerar.
- Confusión o "no sé qué me pasa": compañía en la niebla, sin exigir claridad ya.

Salida: solo JSON válido, sin markdown, con:
{"mensaje_empatico":"..."}
No agregues otros campos ni texto adicional fuera del JSON.`;

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
/** Clave desde https://aistudio.google.com/apikey — en Supabase: secret GEMINI_API_KEY */
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? '';
/** Ej. gemini-2.0-flash, gemini-1.5-flash — ver modelos en Google AI Studio */
const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.0-flash';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Respuesta empática local si Gemini falla */
function chooseFallbackMensaje(mensaje: string): string {
  const t = mensaje.toLowerCase();

  if (/(ansiedad|ansioso|insomnio|ataque|pánico|panico|nervios|no puedo dormir)/i.test(t)) {
    return (
      'Lo que te pasa en el cuerpo cuando la ansiedad sube es real, no es drama. ' +
      'A veces la mente acelera y el pecho no alcanza a acompañar, y aun así estás haciendo lo que podés. ' +
      'No hace falta que lo resuelvas todo ahora: un respiro más largo, un momento de menos ruido, ya es un gesto de cuidado. ' +
      'Dale tiempo al cuerpo para aflojar, de a poco y sin exigencias.'
    );
  }
  if (/(solo|soledad|triste|tristeza|vacío|vacio|llorar|lloro|deprim)/i.test(t)) {
    return (
      'La tristeza a veces ocupa lugar como una manta pesada, y no por eso estás roto. ' +
      'Sentirte solo o sola con lo que te pasa es humano; no tenés que atravesarlo con sonrisa forzada. ' +
      'Podés dejar que algo cálido te rodee aunque por dentro siga el dolor: eso también es sanar de a poquito. ' +
      'Acá nadie te apura a "estar mejor" ya.'
    );
  }
  if (/(hiperactiv|distra|enfoque|concentr|mil cosas en la cabeza)/i.test(t)) {
    return (
      'Cuando la cabeza no para de saltar de un tema a otro, no es que seas flojo: es que el sistema pide descarga. ' +
      'Poner la atención en una sola cosa por unos minutos puede ayudarte a bajar revoluciones sin pelear con tus pensamientos. ' +
      'No tenés que ganarle a la mente; alcanza con acompañarla un ratito con algo que no te exija. ' +
      'Regalate ese espacio sin culpa.'
    );
  }
  if (/(agotado|colapsado|desconect|burnout|reventad|sin energía|sin energia)/i.test(t)) {
    return (
      'El agotamiento que no se va con dormir un poco más es señal de que venís cargando de más hace rato. ' +
      'No es poca cosa: el cuerpo pide tregua aunque la cabeza siga en lista de pendientes. ' +
      'Permitite hoy algo más simple que rendir: podés soltar un cambio y hacer una pausa sin pedirte nada a cambio. ' +
      'Lo que sentís tiene sentido.'
    );
  }
  if (/(enojad|ira|furios|frustrad|bronca)/i.test(t)) {
    return (
      'La bronca y la frustración también son energía que pide salida; no te hacen mala persona. ' +
      'A veces lo que más duele es sentir que no te escuchan o que no alcanza lo que das. ' +
      'Podés honrar ese fuego sin apurarte a "relajarte ya": primero nombrar qué te pasa, después aflojar el cuerpo un poco. ' +
      'Respirar más lento por un minuto puede ayudarte a bajar la temperatura sin negar lo que sentís.'
    );
  }
  if (/(miedo|temor|inciert|angustiad)/i.test(t)) {
    return (
      'El miedo a lo que viene o a lo que no controlás es pesado, y aun así no define quién sos. ' +
      'Podés quedarte un momento en el presente, con algo que ancle los sentidos, sin resolver el futuro entero hoy. ' +
      'No estás solo en esa incertidumbre: mucha gente la vive en silencio. ' +
      'Un paso chico, como seguir el aliento, ya es coraje.'
    );
  }
  if (/(culpa|vergüenza|verguenz)/i.test(t)) {
    return (
      'La culpa nos aprieta como si fuéramos juez y acusado a la vez. ' +
      'Si hoy podés mirarte con un poquito más de ternura, ya estás cambiando el guion. ' +
      'No tenés que merecer descanso: lo necesitás como cualquier persona viva. ' +
      'Permitite un momento calmado que te recuerde que no sos solo tus errores.'
    );
  }
  if (/(feliz|bien|gratitud|en paz|tranquilo|contento)/i.test(t)) {
    return (
      'Qué lindo que puedas nombrar un momento de bien o de calma; eso también se entrena. ' +
      'No hace falta minimizarlo por si mañana cambia el clima emocional: disfrutá este respiro. ' +
      'Podés quedarte un rato en esa sensación para sellar lo que ya te hace bien. ' +
      'Seguí cultivando esos micro-instantes de paz.'
    );
  }
  if (/(meditar|meditación|meditacion|presente|zen|calmo)/i.test(t)) {
    return (
      'Si buscás volver al centro, ya diste el paso más importante: notar que querés un lugar más quieto adentro. ' +
      'La meditación no es competencia de silencio perfecto; es volver una y otra vez con gentileza. ' +
      'Podés apoyarte en la respiración para marcar el ritmo sin exigirte nada. ' +
      'Lo que importa es que estés acá, probando.'
    );
  }
  if (/(no sé|no se|confus|mezclad|raro)/i.test(t)) {
    return (
      'Cuando no sabés bien qué te pasa, la confusión misma es información: algo necesita espacio para ordenarse. ' +
      'No tenés que tenerlo todo claro para merecer calma. ' +
      'Una pausa en silencio puede ser compañía mientras el sentido aparece más despacio. ' +
      'Andá a tu ritmo, sin prisa de etiquetar lo que sentís.'
    );
  }
  return (
    'A veces los días se sienten más anchos por dentro de lo que podés explicar, y aun así estás acá, aguantando. ' +
    'No hace falta que lo resuelvas todo de una: un ratito de respiración puede ser puente, no solución mágica. ' +
    'Regalate un momento de cuidado sin pedirte rendimiento. ' +
    'Este momento también puede aflojar, de a poco.'
  );
}

function stripJsonFence(rawText: string): string {
  const t = rawText.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/im.exec(t);
  return fenced ? fenced[1].trim() : t;
}

function normalizeModelJson(rawText: string): GuiaZenResponse {
  const cleaned = stripJsonFence(rawText);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('La IA devolvio un JSON invalido');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('La IA devolvio un formato no esperado');
  }

  const maybeMensaje = (parsed as { mensaje_empatico?: unknown }).mensaje_empatico;
  if (typeof maybeMensaje !== 'string' || maybeMensaje.trim().length < 3) {
    throw new Error('Falta mensaje empatico valido');
  }

  const mensaje = maybeMensaje.trim();
  const mensajeCorto = mensaje.length > 1600 ? mensaje.slice(0, 1597) + '...' : mensaje;

  return {
    mensaje_empatico: mensajeCorto,
  };
}

async function askZenGuide(mensajeUsuario: string): Promise<GuiaZenResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

  const completionResponse = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: `Estado actual del usuario: ${mensajeUsuario}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!completionResponse.ok) {
    const body = await completionResponse.text();
    throw new Error(`Fallo llamada IA: ${completionResponse.status} ${body}`);
  }

  const completionData = await completionResponse.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    error?: { message?: string };
  };

  if (!completionData?.candidates?.length) {
    const errMsg = completionData?.error?.message;
    throw new Error(errMsg ?? 'Gemini no devolvio candidatos (revisa modelo o politicas)');
  }

  const text =
    completionData.candidates[0]?.content?.parts?.map(p => p.text ?? '').join('') ?? '';

  if (typeof text !== 'string' || !text.trim()) {
    const errMsg = completionData?.error?.message;
    throw new Error(errMsg ? `Respuesta Gemini: ${errMsg}` : 'Respuesta de IA vacia');
  }

  return normalizeModelJson(text.trim());
}

async function saveReflection(
  userId: string | null,
  mensajeUsuario: string,
  result: GuiaZenResponse,
): Promise<void> {
  const { error } = await supabaseAdmin.from('reflexiones_guia_zen').insert({
    user_id: userId,
    sentimiento_texto: mensajeUsuario,
    mensaje_empatico: result.mensaje_empatico,
    metadata: { source: 'edge-function-guia-zen' },
  });

  if (error) {
    throw new Error(`No se pudo guardar reflexion: ${error.message}`);
  }
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Metodo no permitido' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  if (!GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          'Falta GEMINI_API_KEY en secretos de Supabase (creala en https://aistudio.google.com/apikey)',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const body = (await req.json()) as GuiaZenRequestBody;
    const mensajeUsuario = body?.mensaje?.trim();

    if (!mensajeUsuario || mensajeUsuario.length < 3) {
      return new Response(
        JSON.stringify({ error: 'Contame en al menos 3 caracteres como te sentis.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const safeUserId =
      typeof body.user_id === 'string' && body.user_id.trim().length > 0 ? body.user_id.trim() : null;

    let aiResult: GuiaZenResponse;
    try {
      aiResult = await askZenGuide(mensajeUsuario);
    } catch {
      aiResult = {
        mensaje_empatico: chooseFallbackMensaje(mensajeUsuario),
      };
    }

    await saveReflection(safeUserId, mensajeUsuario, aiResult);

    return new Response(JSON.stringify(aiResult), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en guia-zen:', error);
    return new Response(
      JSON.stringify({
        error: 'Ahora mismo no pude conectar con tu guía. Probá de nuevo en unos segundos.',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
