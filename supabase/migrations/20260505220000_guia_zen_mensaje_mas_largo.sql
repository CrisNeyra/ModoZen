-- Respuestas del Guía Zen más completas (hasta ~1600 caracteres).

alter table public.reflexiones_guia_zen
  drop constraint if exists reflexiones_guia_zen_mensaje_empatico_check;

alter table public.reflexiones_guia_zen
  add constraint reflexiones_guia_zen_mensaje_empatico_check
  check (char_length(mensaje_empatico) between 3 and 1600);
