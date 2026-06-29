alter table public.pedidos add column if not exists cliente_nombre text;
alter table public.pedidos add column if not exists destino_direccion text;
alter table public.pedidos add column if not exists referencia text;
alter table public.pedidos add column if not exists observaciones text;
alter table public.pedidos add column if not exists fecha_programada date;
alter table public.pedidos add column if not exists productos text;

alter table public.pedidos alter column estado set default 'pendiente';

update public.pedidos
set estado = 'pendiente'
where estado is null;

drop policy if exists "pedidos_insert_own_company_or_admin" on public.pedidos;
create policy "pedidos_insert_own_company_or_admin"
on public.pedidos
for insert
to authenticated
with check (empresa_id = public.current_user_empresa_id() or public.is_admin());
