create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  nombre text not null check (char_length(nombre) between 2 and 120),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_perfiles_email on public.perfiles (email);

alter table public.perfiles enable row level security;

drop policy if exists "Users can insert own profile" on public.perfiles;
create policy "Users can insert own profile"
on public.perfiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can read own profile" on public.perfiles;
create policy "Users can read own profile"
on public.perfiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.perfiles;
create policy "Users can update own profile"
on public.perfiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
