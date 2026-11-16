import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
export const CMS_TAG = "cms";

/** Server-side read client. Responses are cached and tagged so /api/revalidate can purge them. */
export function serverClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 3600, tags: [CMS_TAG] } } as RequestInit),
    },
  });
}

let browser: SupabaseClient | null = null;
/** Browser client (admin panel, contact form, click tracking). */
export function browserClient(): SupabaseClient {
  if (!browser) browser = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
  return browser;
}
