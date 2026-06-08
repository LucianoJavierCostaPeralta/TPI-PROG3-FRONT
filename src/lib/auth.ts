import { supabase } from './supabase';
import {
  EMAIL_CONFIRM_CALLBACK_URL,
  PASSWORD_RESET_CALLBACK_URL,
} from './authRedirect';

export type SignUpPayload = {
  companyName: string;
  cuit: string;
  email: string;
  password: string;
  phone: string;
};

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw error;

  return data;
}

export async function signUpCompany(payload: SignUpPayload) {
  console.log('EMAIL_CONFIRM_CALLBACK_URL:', EMAIL_CONFIRM_CALLBACK_URL);

  const { data, error } = await supabase.auth.signUp({
    email: payload.email.trim(),
    password: payload.password,
    options: {
      emailRedirectTo: EMAIL_CONFIRM_CALLBACK_URL,
      data: {
        nombre: payload.companyName.trim(),
        cuit: payload.cuit.trim(),
        telefono: payload.phone.trim(),
        rol: 'asesor',
      },
    },
  });

  if (error) throw error;

  return data;
}

export async function sendEmailConfirmation(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim(),
    options: {
      emailRedirectTo: EMAIL_CONFIRM_CALLBACK_URL,
    },
  });

  if (error) throw error;
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