import { createBrowserClient } from "@supabase/ssr";

// Helper to validate URL
function isValidUrl(url: string | undefined): url is string {
  if (!url || url === "undefined" || url === "null" || url.trim() === "") {
    return false;
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Create browser client without strict Database typing
// to avoid type inference issues with supabase-js generics
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Guard against missing/invalid env vars during SSR/build
  if (!isValidUrl(supabaseUrl) || !supabaseKey || supabaseKey === "undefined" || supabaseKey === "null") {
    // Return a minimal mock client that won't crash
    // This happens during build/SSR before env vars are available
    return {
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: new Error("Not configured") }) }) }),
      }),
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error("Not configured") }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
