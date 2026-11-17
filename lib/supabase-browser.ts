import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let clientPromise: Promise<SupabaseClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!clientPromise) {
    clientPromise = fetch('/api/supabase-config', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Supabase 연결 정보를 불러오지 못했습니다.');
        return response.json() as Promise<{ url: string; anonKey: string }>;
      })
      .then(({ url, anonKey }) => createClient(url, anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
      }));
  }
  return clientPromise;
}

export async function ensureAnonymousSession() {
  const client = await getSupabaseBrowserClient();
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw sessionError;
  if (sessionData.session) return client;

  const { error } = await client.auth.signInAnonymously({ options: { data: { app: 'chem-lab-simulator' } } });
  if (error) throw error;
  return client;
}

