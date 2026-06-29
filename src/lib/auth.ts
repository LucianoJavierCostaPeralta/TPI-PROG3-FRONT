import { supabase } from './supabase';
import { PASSWORD_RESET_CALLBACK_URL } from './authRedirect';

export type SignUpPayload = {
  companyName: string;
  cuit: string;
  email: string;
  password: string;
  phone: string;
};

function normalizeCuit(cuit: string) {
  const digits = cuit.replace(/\D/g, '');
  return digits.length === 11 ? digits : null;
}

async function ensureCompany(payload: SignUpPayload) {
  const cuit = normalizeCuit(payload.cuit);
  const email = payload.email.trim();
  const company = {
    nombre: payload.companyName.trim(),
    cuit,
    email,
    telefono: payload.phone.trim() || null,
  };

  if (cuit) {
    const { data, error } = await supabase
      .from('empresas')
      .upsert(company, { onConflict: 'cuit' })
      .select('id')
      .single();

    if (error) throw error;

    return data.id as string;
  }

  const { data: existingCompany, error: selectError } = await supabase
    .from('empresas')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (selectError) throw selectError;

  if (existingCompany?.id) {
    const { error } = await supabase
      .from('empresas')
      .update(company)
      .eq('id', existingCompany.id);

    if (error) throw error;

    return existingCompany.id as string;
  }

  const { data, error } = await supabase
    .from('empresas')
    .insert(company)
    .select('id')
    .single();

  if (error) throw error;

  return data.id as string;
}

async function upsertCompanyProfile(userId: string, payload: SignUpPayload) {
  const companyId = await ensureCompany(payload);

  const { error } = await supabase.from('usuarios').upsert(
    {
      id: userId,
      empresa_id: companyId,
      nombre: payload.companyName.trim(),
      email: payload.email.trim(),
      rol: 'administrador',
      telefono: payload.phone.trim() || null,
      activo: true,
    },
    { onConflict: 'id' },
  );

  if (error) throw error;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw error;

  return data;
}

export async function signUpCompany(payload: SignUpPayload) {
  const normalizedCuit = normalizeCuit(payload.cuit);
  const { data, error } = await supabase.auth.signUp({
    email: payload.email.trim(),
    password: payload.password,
    options: {
      data: {
        nombre: payload.companyName.trim(),
        cuit: normalizedCuit,
        telefono: payload.phone.trim(),
        rol: 'administrador',
      },
    },
  });

  if (error) throw error;

  if (data.user) {
    await upsertCompanyProfile(data.user.id, payload);
  }

  return data;
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim(),
    {
      redirectTo: PASSWORD_RESET_CALLBACK_URL,
    }
  );

  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });

  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}
