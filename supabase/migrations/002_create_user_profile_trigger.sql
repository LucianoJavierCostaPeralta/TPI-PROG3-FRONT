create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, nombre, email, rol, telefono)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'nombre', ''), split_part(new.email, '@', 1)),
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'rol', ''), 'asesor')::public.user_role,
    nullif(new.raw_user_meta_data ->> 'telefono', '')
  )
  on conflict (id) do update
  set
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
