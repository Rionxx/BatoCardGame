import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Supabaseクライアントの初期化。環境変数が未設定の場合はnullを返し、
// オンライン機能だけが無効になる（既存のオフライン機能には一切影響しない）。
//
// 必要な環境変数（.env / Netlifyの環境変数に設定する）:
//   VITE_SUPABASE_URL      … SupabaseプロジェクトのURL
//   VITE_SUPABASE_ANON_KEY … 同プロジェクトのanonキー

let client: SupabaseClient | null | undefined;

export function isOnlineConfigured(): boolean {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  if (!isOnlineConfigured()) {
    client = null;
    return client;
  }
  client = createClient(import.meta.env.VITE_SUPABASE_URL as string, import.meta.env.VITE_SUPABASE_ANON_KEY as string, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return client;
}

/** 匿名サインイン（アカウント登録UIなしでオンライン対戦できるようにする）。
 *  既にセッションがあればそれを使う。SupabaseダッシュボードでAnonymous Sign-insを有効にすること。 */
export async function ensureSignedIn(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: sessionData } = await sb.auth.getSession();
  if (sessionData.session) return sessionData.session.user.id;
  const { data, error } = await sb.auth.signInAnonymously();
  if (error || !data.user) return null;
  return data.user.id;
}
