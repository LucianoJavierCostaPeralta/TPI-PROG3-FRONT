create extension if not exists pgcrypto;

create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  cuit text unique,
  email text,
  telefono text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.empresas add column if not exists nombre text;
alter table public.empresas add column if not exists cuit text;
alter table public.empresas alter column cuit drop not null;
alter table public.empresas add column if not exists email text;
alter table public.empresas add column if not exists telefono text;
alter table public.empresas add column if not exists activo boolean not null default true;
alter table public.empresas add column if not exists created_at timestamptz not null default now();
alter table public.empresas add column if not exists updated_at timestamptz not null default now();

create unique index if not exists empresas_cuit_unique on public.empresas (cuit);

drop trigger if exists empresas_set_updated_at on public.empresas;
create trigger empresas_set_updated_at
before update on public.empresas
for each row
execute function public.set_updated_at();

alter table public.usuarios add column if not exists empresa_id uuid references public.empresas(id) on delete set null;

create or replace function public.is_advisor()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.usuarios
    where id = auth.uid()
      and rol = 'asesor'
      and activo = true
  );
$$;

create table if not exists public.choferes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nombre text not null,
  email text,
  telefono text,
  documento text,
  usuario_id uuid references auth.users(id) on delete set null,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.choferes add column if not exists usuario_id uuid references auth.users(id) on delete set null;

drop trigger if exists choferes_set_updated_at on public.choferes;
create trigger choferes_set_updated_at
before update on public.choferes
for each row
execute function public.set_updated_at();

create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  estado text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists pedidos_set_updated_at on public.pedidos;
create trigger pedidos_set_updated_at
before update on public.pedidos
for each row
execute function public.set_updated_at();

alter table public.pedidos add column if not exists empresa_id uuid references public.empresas(id) on delete set null;
alter table public.pedidos add column if not exists chofer_id uuid references public.choferes(id) on delete set null;

create index if not exists usuarios_empresa_id_idx on public.usuarios (empresa_id);
create index if not exists choferes_empresa_id_idx on public.choferes (empresa_id);
create index if not exists choferes_usuario_id_idx on public.choferes (usuario_id);
create unique index if not exists choferes_usuario_id_unique on public.choferes (usuario_id) where usuario_id is not null;
create unique index if not exists choferes_empresa_email_unique on public.choferes (empresa_id, email) where email is not null;
create index if not exists pedidos_empresa_id_idx on public.pedidos (empresa_id);
create index if not exists pedidos_chofer_id_idx on public.pedidos (chofer_id);

create or replace function public.current_user_empresa_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select empresa_id
  from public.usuarios
  where id = auth.uid()
    and activo = true
  limit 1;
$$;

alter table public.empresas enable row level security;
alter table public.choferes enable row level security;

drop policy if exists "usuarios_select_own_or_admin" on public.usuarios;
create policy "usuarios_select_own_or_admin"
on public.usuarios
for select
to authenticated
using (id = auth.uid() or public.is_admin() or public.is_advisor());

drop policy if exists "empresas_select_own_or_admin" on public.empresas;
create policy "empresas_select_own_or_admin"
on public.empresas
for select
to authenticated
using (id = public.current_user_empresa_id() or public.is_admin());

drop policy if exists "empresas_insert_authenticated" on public.empresas;
create policy "empresas_insert_authenticated"
on public.empresas
for insert
to authenticated
with check (true);

drop policy if exists "empresas_update_own_or_admin" on public.empresas;
create policy "empresas_update_own_or_admin"
on public.empresas
for update
to authenticated
using (id = public.current_user_empresa_id() or public.is_admin())
with check (id = public.current_user_empresa_id() or public.is_admin());

drop policy if exists "choferes_select_own_company_or_admin" on public.choferes;
create policy "choferes_select_own_company_or_admin"
on public.choferes
for select
to authenticated
using (empresa_id = public.current_user_empresa_id() or public.is_admin());

drop policy if exists "choferes_insert_own_company_or_admin" on public.choferes;
create policy "choferes_insert_own_company_or_admin"
on public.choferes
for insert
to authenticated
with check (empresa_id = public.current_user_empresa_id() or public.is_admin());

drop policy if exists "choferes_update_own_company_or_admin" on public.choferes;
create policy "choferes_update_own_company_or_admin"
on public.choferes
for update
to authenticated
using (empresa_id = public.current_user_empresa_id() or public.is_admin())
with check (empresa_id = public.current_user_empresa_id() or public.is_admin());

drop policy if exists "pedidos_select_own_company_or_admin" on public.pedidos;
create policy "pedidos_select_own_company_or_admin"
on public.pedidos
for select
to authenticated
using (empresa_id = public.current_user_empresa_id() or public.is_admin());

drop policy if exists "pedidos_update_own_company_or_admin" on public.pedidos;
create policy "pedidos_update_own_company_or_admin"
on public.pedidos
for update
to authenticated
using (empresa_id = public.current_user_empresa_id() or public.is_admin())
with check (empresa_id = public.current_user_empresa_id() or public.is_admin());

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  company_id uuid;
  company_name text;
  company_cuit text;
begin
  company_name := coalesce(nullif(new.raw_user_meta_data ->> 'nombre', ''), split_part(new.email, '@', 1));
  company_cuit := nullif(regexp_replace(coalesce(new.raw_user_meta_data ->> 'cuit', ''), '[^0-9]', '', 'g'), '');

  if company_cuit is not null and length(company_cuit) <> 11 then
    company_cuit := null;
  end if;

  if coalesce(nullif(new.raw_user_meta_data ->> 'rol', ''), 'administrador') = 'administrador' then
    if company_cuit is not null then
      insert into public.empresas (nombre, cuit, email, telefono)
      values (
        company_name,
        company_cuit,
        new.email,
        nullif(new.raw_user_meta_data ->> 'telefono', '')
      )
      on conflict (cuit) do update
      set
        nombre = excluded.nombre,
        email = excluded.email,
        telefono = excluded.telefono
      returning id into company_id;
    else
      select id into company_id
      from public.empresas
      where email = new.email
      limit 1;

      if company_id is null then
        insert into public.empresas (nombre, cuit, email, telefono)
        values (
          company_name,
          null,
          new.email,
          nullif(new.raw_user_meta_data ->> 'telefono', '')
        )
        returning id into company_id;
      else
        update public.empresas
        set
          nombre = company_name,
          email = new.email,
          telefono = nullif(new.raw_user_meta_data ->> 'telefono', '')
        where id = company_id;
      end if;
    end if;
  end if;

  insert into public.usuarios (id, empresa_id, nombre, email, rol, telefono)
  values (
    new.id,
    company_id,
    company_name,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'rol', ''), 'administrador')::public.user_role,
    nullif(new.raw_user_meta_data ->> 'telefono', '')
  )
  on conflict (id) do update
  set
    empresa_id = coalesce(public.usuarios.empresa_id, excluded.empresa_id),
    nombre = excluded.nombre,
    email = excluded.email,
    rol = excluded.rol,
    telefono = excluded.telefono;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

with auth_companies as (
  select
    auth_user.email,
    coalesce(nullif(auth_user.raw_user_meta_data ->> 'nombre', ''), split_part(auth_user.email, '@', 1)) as nombre,
    case
      when length(regexp_replace(coalesce(auth_user.raw_user_meta_data ->> 'cuit', ''), '[^0-9]', '', 'g')) = 11
        then regexp_replace(coalesce(auth_user.raw_user_meta_data ->> 'cuit', ''), '[^0-9]', '', 'g')
      else null
    end as cuit,
    nullif(auth_user.raw_user_meta_data ->> 'telefono', '') as telefono
  from auth.users as auth_user
  where auth_user.email is not null
    and coalesce(nullif(auth_user.raw_user_meta_data ->> 'rol', ''), 'administrador') = 'administrador'
), valid_cuit_companies as (
  insert into public.empresas (nombre, cuit, email, telefono)
  select distinct on (cuit)
    nombre,
    cuit,
    email,
    telefono
  from auth_companies
  where cuit is not null
  on conflict (cuit) do update
  set
    nombre = excluded.nombre,
    email = excluded.email,
    telefono = excluded.telefono
  returning id
)
insert into public.empresas (nombre, cuit, email, telefono)
select distinct on (email)
  auth_companies.nombre,
  null,
  auth_companies.email,
  auth_companies.telefono
from auth_companies
where auth_companies.cuit is null
  and not exists (
    select 1
    from public.empresas as existing_company
    where existing_company.email = auth_companies.email
  );

with auth_profiles as (
  select
    auth_user.id,
    auth_user.email,
    case
      when length(regexp_replace(coalesce(auth_user.raw_user_meta_data ->> 'cuit', ''), '[^0-9]', '', 'g')) = 11
        then regexp_replace(coalesce(auth_user.raw_user_meta_data ->> 'cuit', ''), '[^0-9]', '', 'g')
      else null
    end as cuit
  from auth.users as auth_user
)
update public.usuarios as user_profile
set empresa_id = company.id
from auth_profiles as auth_user
join public.empresas as company
  on (
    auth_user.cuit is not null
      and company.cuit = auth_user.cuit
    or auth_user.cuit is null
      and company.email = auth_user.email
  )
where user_profile.id = auth_user.id
  and user_profile.empresa_id is null
  and user_profile.rol in ('asesor', 'administrador');

update public.usuarios
set rol = 'administrador'
where rol = 'asesor'
  and empresa_id is not null;
