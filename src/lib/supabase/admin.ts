import { createClient } from "@supabase/supabase-js";

// Create admin client without strict Database typing
// to avoid type inference issues with supabase-js generics
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Guard against missing env vars during SSR/build
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are not configured");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
