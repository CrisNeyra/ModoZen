-- La app usa IDs locales (AsyncStorage), no auth.users de Supabase.
-- Quitar FK y usar text para que guia-zen pueda persistir reflexiones.

drop policy if exists "Users can insert own reflections" on public.reflexiones_guia_zen;
drop policy if exists "Users can read own reflections" on public.reflexiones_guia_zen;

alter table public.reflexiones_guia_zen
  drop constraint if exists reflexiones_guia_zen_user_id_fkey;

alter table public.reflexiones_guia_zen
  alter column user_id drop not null;

alter table public.reflexiones_guia_zen
  alter column user_id type text using (user_id::text);

create policy "Users can insert own reflections"
on public.reflexiones_guia_zen
for insert
to authenticated
with check (auth.uid()::text = user_id);

create policy "Users can read own reflections"
on public.reflexiones_guia_zen
for select
to authenticated
using (auth.uid()::text = user_id);
