create type public.user_role as enum ('administrador', 'chofer', 'asesor');

create table public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  email text not null unique,
  rol public.user_role not null default 'asesor',
  telefono text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger usuarios_set_updated_at
before update on public.usuarios
for each row
execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.usuarios
    where id = auth.uid()
      and rol = 'administrador'
      and activo = true
  );
$$;

alter table public.usuarios enable row level security;

create policy "usuarios_select_own_or_admin"
on public.usuarios
for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy "usuarios_update_own_or_admin"
on public.usuarios
for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "usuarios_insert_admin"
on public.usuarios
for insert
to authenticated
with check (public.is_admin());

create policy "usuarios_delete_admin"
on public.usuarios
for delete
to authenticated
using (public.is_admin());
