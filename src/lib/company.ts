import { supabase } from './supabase';

export type UserRole = 'administrador' | 'asesor' | 'chofer';

export type Company = {
  id: string;
  nombre: string;
  cuit: string | null;
  email: string | null;
  telefono: string | null;
};

export type UserProfile = {
  id: string;
  empresa_id: string | null;
  nombre: string;
  email: string;
  rol: UserRole;
  telefono: string | null;
  activo: boolean;
  created_at?: string;
};

export type Driver = {
  id: string;
  empresa_id: string;
  usuario_id: string | null;
  nombre: string;
  email: string | null;
  telefono: string | null;
  documento: string | null;
  vehiculo?: unknown;
  vehicle?: unknown;
  patente?: unknown;
  zona?: unknown;
  zone?: unknown;
  activo: boolean;
  created_at: string;
};

export type DeliveryOrder = {
  id: string;
  empresa_id?: string | null;
  chofer_id?: string | null;
  estado?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
};

export type CreateDriverPayload = {
  nombre: string;
  email: string;
  telefono: string;
  documento: string;
};

export type CreateDeliveryPayload = {
  cliente: string;
  destino: string;
  referencia: string;
  observaciones: string;
  fecha: string;
  productos: string;
};

export type AppWorkspace = {
  profile: UserProfile;
  company: Company | null;
  drivers: Driver[];
  orders: DeliveryOrder[];
  admins: UserProfile[];
};

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;
  if (!data.user) throw new Error('No hay una sesión activa.');

  return data.user.id;
}

async function getCurrentProfile() {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('usuarios')
    .select('id,empresa_id,nombre,email,rol,telefono,activo,created_at')
    .eq('id', userId)
    .single();

  if (error) throw error;

  return data as UserProfile;
}

export async function getAppWorkspace(): Promise<AppWorkspace> {
  const profile = await getCurrentProfile();

  if (profile.rol === 'asesor') {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id,empresa_id,nombre,email,rol,telefono,activo,created_at')
      .eq('rol', 'administrador')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      profile,
      company: null,
      drivers: [],
      orders: [],
      admins: (data as UserProfile[] | null) ?? [],
    };
  }

  if (profile.rol === 'chofer') {
    const { data: driver, error: driverError } = await supabase
      .from('choferes')
      .select('id,empresa_id,usuario_id,nombre,email,telefono,documento,activo,created_at')
      .eq('usuario_id', profile.id)
      .maybeSingle();

    if (driverError) throw driverError;

    const driverRecord = driver as Driver | null;

    if (!driverRecord) {
      return { profile, company: null, drivers: [], orders: [], admins: [] };
    }

    const [companyResult, ordersResult] = await Promise.all([
      supabase
        .from('empresas')
        .select('id,nombre,cuit,email,telefono')
        .eq('id', driverRecord.empresa_id)
        .maybeSingle(),
      supabase
        .from('pedidos')
        .select('*')
        .eq('chofer_id', profile.id)
        .order('created_at', { ascending: false }),
    ]);

    if (companyResult.error) throw companyResult.error;
    if (ordersResult.error) throw ordersResult.error;

    return {
      profile,
      company: (companyResult.data as Company | null) ?? null,
      drivers: [driverRecord],
      orders: (ordersResult.data as DeliveryOrder[] | null) ?? [],
      admins: [],
    };
  }

  const companyId = profile.empresa_id;

  if (!companyId) {
    return { profile, company: null, drivers: [], orders: [], admins: [] };
  }

  const [companyResult, driversResult, ordersResult] = await Promise.all([
    supabase
      .from('empresas')
      .select('id,nombre,cuit,email,telefono')
      .eq('id', companyId)
      .maybeSingle(),
    supabase
      .from('choferes')
      .select('id,empresa_id,usuario_id,nombre,email,telefono,documento,activo,created_at')
      .eq('empresa_id', companyId)
      .order('created_at', { ascending: false }),
    supabase
      .from('pedidos')
      .select('*')
      .eq('empresa_id', companyId)
      .order('created_at', { ascending: false }),
  ]);

  if (companyResult.error) throw companyResult.error;
  if (driversResult.error) throw driversResult.error;
  if (ordersResult.error) throw ordersResult.error;

  return {
    profile,
    company: (companyResult.data as Company | null) ?? null,
    drivers: (driversResult.data as Driver[] | null) ?? [],
    orders: (ordersResult.data as DeliveryOrder[] | null) ?? [],
    admins: [],
  };
}

export async function createDriver(payload: CreateDriverPayload) {
  const { data, error } = await supabase.functions.invoke('create-driver', {
    body: payload,
  });

  if (error) throw error;

  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error(String((data as { error: unknown }).error));
  }

  return data as { ok: boolean; initialPassword: string } | null;
}

export async function createDelivery(payload: CreateDeliveryPayload) {
  const profile = await getCurrentProfile();

  if (profile.rol !== 'administrador') {
    throw new Error('Solo el administrador de la empresa puede crear entregas.');
  }

  if (!profile.empresa_id) {
    throw new Error('Tu usuario no tiene una empresa asociada.');
  }

  const cliente = payload.cliente.trim();
  const destino = payload.destino.trim();

  if (!cliente) throw new Error('Ingresá el cliente.');
  if (!destino) throw new Error('Ingresá el destino.');

  const { error } = await supabase
    .from('pedidos')
    .insert({
      empresa_id: profile.empresa_id,
      creado_por: profile.id,
      creador_id: profile.id,
      estado: 'pendiente',
      cliente_nombre: cliente,
      destino_direccion: destino,
      referencia: payload.referencia.trim() || null,
      observaciones: payload.observaciones.trim() || null,
      fecha_programada: payload.fecha.trim() || null,
      productos: payload.productos.trim() || null,
    });

  if (error) throw error;
}

export async function assignOrderDriver(orderId: string, driverId: string | null) {
  const profile = await getCurrentProfile();

  if (profile.rol !== 'administrador') {
    throw new Error('Solo el administrador de la empresa puede asignar pedidos.');
  }

  if (!profile.empresa_id) {
    throw new Error('Tu usuario no tiene una empresa asociada.');
  }

  let driverUserId: string | null = null;

  if (driverId) {
    const { data: driver, error: driverError } = await supabase
      .from('choferes')
      .select('usuario_id')
      .eq('id', driverId)
      .eq('empresa_id', profile.empresa_id)
      .single();

    if (driverError) throw driverError;
    if (!driver?.usuario_id) throw new Error('El chofer no tiene usuario asociado.');

    driverUserId = driver.usuario_id;
  }

  const { error } = await supabase
    .from('pedidos')
    .update({ chofer_id: driverUserId })
    .eq('id', orderId)
    .eq('empresa_id', profile.empresa_id);

  if (error) throw error;
}

export async function updateOrderStatus(orderId: string, estado: string) {
  const profile = await getCurrentProfile();

  if (profile.rol === 'administrador') {
    if (!profile.empresa_id) {
      throw new Error('Tu usuario no tiene una empresa asociada.');
    }

    const { error } = await supabase
      .from('pedidos')
      .update({ estado })
      .eq('id', orderId)
      .eq('empresa_id', profile.empresa_id);

    if (error) throw error;
    return;
  }

  if (profile.rol !== 'chofer') {
    throw new Error('Solo el administrador o el chofer asignado pueden actualizar el estado.');
  }

  const { error } = await supabase
    .from('pedidos')
    .update({ estado })
    .eq('id', orderId)
    .eq('chofer_id', profile.id);

  if (error) throw error;
}
