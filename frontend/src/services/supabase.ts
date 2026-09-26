import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Read environment variables or use configured defaults
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

/**
 * Sign in with Google using Supabase OAuth.
 */
export async function signInWithGoogle(): Promise<{ error: Error | null; url?: string }> {
  if (!supabase) {
    console.info('Supabase credentials not configured yet (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY). Simulating Google authentication for demo.');
    return { error: null };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    return { error };
  }

  return { error: null, url: data.url };
}

/**
 * Sign in with GitHub using Supabase OAuth.
 */
export async function signInWithGitHub(): Promise<{ error: Error | null; url?: string }> {
  if (!supabase) {
    console.info('Supabase credentials not configured yet. Simulating GitHub authentication for demo.');
    return { error: null };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });

  return { error: error || null, url: data?.url || undefined };
}

/**
 * Sign in with Apple using Supabase OAuth.
 */
export async function signInWithApple(): Promise<{ error: Error | null; url?: string }> {
  if (!supabase) {
    console.info('Supabase credentials not configured yet. Simulating Apple authentication for demo.');
    return { error: null };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });

  return { error: error || null, url: data?.url || undefined };
}

/**
 * Sign in or send a Magic Link with Email.
 */
export async function signInWithEmail(email: string): Promise<{ error: Error | null; message?: string }> {
  if (!supabase) {
    return { error: null, message: 'Signed in as ' + email };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
    },
  });

  if (error) {
    return { error };
  }

  return { error: null, message: 'Check your email for the magic sign-in link!' };
}

/**
 * Sign up with Email and optional full name.
 */
export async function signUpWithEmail(email: string, fullName?: string): Promise<{ error: Error | null; message?: string }> {
  if (!supabase) {
    return { error: null, message: 'Account created for ' + email };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password: Math.random().toString(36).slice(-10) + 'A1!', // temporary random or OTP
    options: {
      data: {
        full_name: fullName || 'Student',
      },
      emailRedirectTo: `${window.location.origin}/`,
    },
  });

  if (error) {
    return { error };
  }

  return { error: null, message: 'Confirmation link sent to your email.' };
}

/**
 * Sign out from Supabase.
 */
export async function signOutSupabase(): Promise<{ error: Error | null }> {
  if (!supabase) return { error: null };
  const { error } = await supabase.auth.signOut();
  return { error };
}
