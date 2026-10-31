import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "./env";

// Database access with the secret key, which bypasses row-level security.
// Server-only: the tables grant nothing to the publishable key (D13).
let client: ReturnType<typeof createClient> | undefined;

export function supabaseAdmin() {
  client ??= createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SECRET_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return client;
}
