alter table public.pedidos
add column if not exists creado_por uuid references public.usuarios(id) on delete restrict;

alter table public.pedidos
add column if not exists creador_id uuid references public.usuarios(id) on delete set null;

create index if not exists pedidos_creado_por_idx on public.pedidos (creado_por);
create index if not exists pedidos_creador_id_idx on public.pedidos (creador_id);

drop policy if exists "pedidos_insert_own_company_or_admin" on public.pedidos;
create policy "pedidos_insert_own_company_or_admin"
on public.pedidos
for insert
to authenticated
with check (
  empresa_id = public.current_user_empresa_id()
  and creado_por = auth.uid()
  and exists (
    select 1
    from public.usuarios as creator
    where creator.id = auth.uid()
      and creator.empresa_id = pedidos.empresa_id
      and creator.rol = 'administrador'
      and creator.activo = true
  )
);
