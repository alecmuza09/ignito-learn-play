-- IGNOTO · Gestión de usuarios: cuentas familiares, aprendices (niños y adultos), roles y panel de admin.

-- ============ Roles ============
create type public.app_role as enum ('admin', 'tutor');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- Security definer para evitar recursión de RLS al consultar roles.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "roles: ver los propios" on public.user_roles
  for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "roles: admin gestiona" on public.user_roles
  for all to authenticated using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ============ Perfiles de cuenta ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null default '',
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);
alter table public.profiles enable row level security;

create policy "profiles: ver el propio o admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "profiles: editar el propio" on public.profiles
  for update to authenticated using (id = auth.uid())
  with check (id = auth.uid() and suspended = (select p.suspended from public.profiles p where p.id = auth.uid()));
create policy "profiles: admin edita" on public.profiles
  for update to authenticated using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Al registrarse: crea perfil y rol tutor. El rol admin nunca se asigna al registrarse
-- (el correo no está verificado en ese momento); el primer admin se asigna a mano por id:
--   insert into public.user_roles (user_id, role)
--   select id, 'admin' from auth.users where email = '<correo>' and email_confirmed_at is not null;
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  insert into public.user_roles (user_id, role) values (new.id, 'tutor');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ Aprendices ============
create table public.learners (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'child' check (kind in ('child', 'adult')),
  name text not null,
  avatar text not null default '🦊',
  age int not null default 8 check (age between 3 and 120),
  level text not null default 'primaria-1-3',
  language text not null default 'es' check (language in ('es', 'en', 'bi')),
  interests text[] not null default '{}',
  subjects jsonb not null default '[]'::jsonb,
  style jsonb not null default '{}'::jsonb,
  companion text not null default 'igno',
  voice_enabled boolean not null default true,
  xp int not null default 0,
  coins int not null default 0,
  streak int not null default 1,
  badges text[] not null default '{}',
  completed_lessons text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);
create index learners_owner_idx on public.learners (owner_id);
alter table public.learners enable row level security;

create policy "learners: el dueño gestiona" on public.learners
  for all to authenticated using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
create policy "learners: admin ve" on public.learners
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "learners: admin edita" on public.learners
  for update to authenticated using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
create policy "learners: admin borra" on public.learners
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger learners_touch before update on public.learners
  for each row execute function public.touch_updated_at();

-- ============ Actividad ============
create table public.activity_log (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  learner_id uuid references public.learners(id) on delete cascade,
  type text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index activity_owner_idx on public.activity_log (owner_id, created_at desc);
create index activity_created_idx on public.activity_log (created_at desc);
alter table public.activity_log enable row level security;

create policy "activity: el dueño inserta" on public.activity_log
  for insert to authenticated with check (
    owner_id = auth.uid()
    and (learner_id is null or exists (select 1 from public.learners l where l.id = learner_id and l.owner_id = auth.uid()))
  );
create policy "activity: ver la propia o admin" on public.activity_log
  for select to authenticated using (owner_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
