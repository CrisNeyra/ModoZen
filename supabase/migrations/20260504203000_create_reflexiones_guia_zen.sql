create extension if not exists pgcrypto;

create table if not exists public.reflexiones_guia_zen (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  sentimiento_texto text not null check (char_length(sentimiento_texto) between 3 and 1200),
  mensaje_empatico text not null check (char_length(mensaje_empatico) between 3 and 700),
  video_recomendado_titulo text not null check (
    video_recomendado_titulo in (
      '1 Hour Tongue Drum Music',
      'ASMR 95 Min',
      'Cuencos de Cuarzo 2',
      'Cuencos de Cuarzo',
      'Ronroneo',
      'Técnica de pintura con depurador de hierro-en lo...'
    )
  ),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_reflexiones_guia_zen_user_id
  on public.reflexiones_guia_zen (user_id);

create index if not exists idx_reflexiones_guia_zen_created_at
  on public.reflexiones_guia_zen (created_at desc);

alter table public.reflexiones_guia_zen enable row level security;

create policy "Users can insert own reflections"
on public.reflexiones_guia_zen
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can read own reflections"
on public.reflexiones_guia_zen
for select
to authenticated
using (auth.uid() = user_id);
