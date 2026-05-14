export const GUIA_ZEN_FUNCTION_URL =
  'https://sxzmzaiadlgeqqwcbdzh.supabase.co/functions/v1/guia-zen';

export interface GuiaZenInput {
  mensaje: string;
  user_id?: string;
}

export interface GuiaZenOutput {
  mensaje_empatico: string;
}

interface ApiErrorPayload {
  error?: string;
}

export async function pedirGuiaZen(
  input: GuiaZenInput,
  signal?: AbortSignal,
): Promise<GuiaZenOutput> {
  const response = await fetch(GUIA_ZEN_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
    signal,
  });

  const text = await response.text();
  let json: GuiaZenOutput | ApiErrorPayload | null = null;
  try {
    json = text ? (JSON.parse(text) as GuiaZenOutput | ApiErrorPayload) : null;
  } catch {
    if (!response.ok) {
      throw new Error('No pudimos interpretar la respuesta del servidor.');
    }
  }

  if (!response.ok) {
    const backendError =
      json && typeof json === 'object' && 'error' in json && typeof json.error === 'string'
        ? json.error
        : 'No pudimos procesar tu reflexión.';
    throw new Error(backendError);
  }

  if (!json || typeof json !== 'object') {
    throw new Error('Respuesta vacía del servidor');
  }

  const maybePayload = json as Partial<GuiaZenOutput>;
  if (typeof maybePayload.mensaje_empatico !== 'string') {
    throw new Error('Respuesta inválida del servidor');
  }

  return {
    mensaje_empatico: maybePayload.mensaje_empatico,
  };
}
