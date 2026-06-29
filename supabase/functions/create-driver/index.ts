// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.107.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const INITIAL_DRIVER_PASSWORD = '123456';

type CreateDriverBody = {
  nombre?: string;
  email?: string;
  telefono?: string;
  documento?: string;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function normalizeDigits(value: string | undefined) {
  return (value ?? '').replace(/\D/g, '');
}

function validateBody(body: CreateDriverBody) {
  const nombre = (body.nombre ?? '').trim();
  const email = (body.email ?? '').trim().toLowerCase();
  const telefono = normalizeDigits(body.telefono);
  const documento = normalizeDigits(body.documento);

  if (!nombre) throw new Error('Ingresá el nombre del chofer.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Ingresá un email válido para el chofer.');
  }
  if (telefono && (telefono.length < 8 || telefono.length > 15)) {
    throw new Error('El teléfono debe tener entre 8 y 15 números.');
  }
  if (documento && documento.length < 7) {
    throw new Error('El DNI debe tener al menos 7 números.');
  }

  return { nombre, email, telefono, documento };
}

async function findUserByEmail(adminClient: any, email: string) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;

    const user = data.users.find((item: { email?: string }) => item.email?.toLowerCase() === email);
    if (user) return user;
    if (data.users.length < 100) break;
  }

  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método no permitido.' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw new Error('Faltan variables de entorno de Supabase en la Edge Function.');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No hay sesión activa.');

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: authData, error: authError } = await userClient.auth.getUser();
    if (authError) throw authError;
    if (!authData.user) throw new Error('No hay sesión activa.');

    const body = validateBody((await req.json()) as CreateDriverBody);

    const { data: adminProfile, error: profileError } = await adminClient
      .from('usuarios')
      .select('id,empresa_id,rol,activo')
      .eq('id', authData.user.id)
      .single();

    if (profileError) throw profileError;
    if (adminProfile.rol !== 'administrador' || !adminProfile.activo) {
      throw new Error('Solo el administrador de la empresa puede crear choferes.');
    }
    if (!adminProfile.empresa_id) {
      throw new Error('Tu usuario no tiene una empresa asociada.');
    }

    const existingUser = await findUserByEmail(adminClient, body.email);
    let driverUserId = existingUser?.id as string | undefined;

    if (!driverUserId) {
      const { data: createdUser, error: createUserError } = await adminClient.auth.admin.createUser({
        email: body.email,
        password: INITIAL_DRIVER_PASSWORD,
        email_confirm: true,
        user_metadata: {
          nombre: body.nombre,
          telefono: body.telefono,
          rol: 'chofer',
        },
      });

      if (createUserError) throw createUserError;
      driverUserId = createdUser.user.id;
    }

    const { error: profileUpsertError } = await adminClient.from('usuarios').upsert(
      {
        id: driverUserId,
        empresa_id: adminProfile.empresa_id,
        nombre: body.nombre,
        email: body.email,
        rol: 'chofer',
        telefono: body.telefono || null,
        activo: true,
      },
      { onConflict: 'id' },
    );

    if (profileUpsertError) throw profileUpsertError;

    const { data: existingDriver, error: driverLookupError } = await adminClient
      .from('choferes')
      .select('id')
      .eq('empresa_id', adminProfile.empresa_id)
      .eq('email', body.email)
      .maybeSingle();

    if (driverLookupError) throw driverLookupError;

    const driverPayload = {
      empresa_id: adminProfile.empresa_id,
      usuario_id: driverUserId,
      nombre: body.nombre,
      email: body.email,
      telefono: body.telefono || null,
      documento: body.documento || null,
      activo: true,
    };

    if (existingDriver?.id) {
      const { error: updateDriverError } = await adminClient
        .from('choferes')
        .update(driverPayload)
        .eq('id', existingDriver.id);

      if (updateDriverError) throw updateDriverError;
    } else {
      const { error: insertDriverError } = await adminClient.from('choferes').insert(driverPayload);
      if (insertDriverError) throw insertDriverError;
    }

    return jsonResponse({ ok: true, initialPassword: INITIAL_DRIVER_PASSWORD });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo crear el chofer.';
    return jsonResponse({ error: message }, 400);
  }
});
