import { supabase } from './supabase';

export type AuthCallbackRoute = 'HomeScreen' | 'ResetPasswordScreen';

function getAuthParams(url: string) {
  const parsedUrl = new URL(url);
  const params = new URLSearchParams(parsedUrl.search);

  if (parsedUrl.hash) {
    const hashParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ''));
    hashParams.forEach((value, key) => params.set(key, value));
  }

  return params;
}

export async function handleAuthCallbackUrl(url: string): Promise<AuthCallbackRoute | null> {
  if (!url.startsWith('expo-app://auth/callback')) {
    return null;
  }

  const params = getAuthParams(url);
  const code = params.get('code');
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const type = params.get('type');

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw error;
    }
  } else if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      throw error;
    }
  }

  return type === 'recovery' ? 'ResetPasswordScreen' : 'HomeScreen';
}
