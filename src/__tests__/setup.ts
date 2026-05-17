/**
 * Global test setup for capture-the-moment
 * Sets env vars so module-level Supabase/Twilio clients don't throw on import.
 */
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
process.env.UPSTASH_REDIS_REST_URL = "";
process.env.UPSTASH_REDIS_REST_TOKEN = "";
process.env.TWILIO_ACCOUNT_SID = "";
process.env.TWILIO_AUTH_TOKEN = "";
process.env.TWILIO_PHONE_NUMBER = "";
Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true });
