import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Create server client without strict Database typing
// to avoid type inference issues with supabase-js generics
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Guard against missing env vars during SSR/build
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are not configured");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component - ignore
        }
      },
    },
  });
}
