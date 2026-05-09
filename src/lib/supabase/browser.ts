import { createBrowserClient } from "@supabase/ssr";

/**
 * Client component'lerde tarayıcıdan kullanılan Supabase client.
 * Aynı oturumun cookie'sini paylaşır.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase env değişkenleri eksik. .env.local dosyasını kontrol edin."
    );
  }

  return createBrowserClient(url, key);
}
