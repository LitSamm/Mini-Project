import "server-only";

import { createClient } from "@supabase/supabase-js";
import { hasSupabaseAdminConfig } from "@/lib/supabase/config";

export function createAdminSupabaseClient() {
  if (!hasSupabaseAdminConfig()) {
    throw new Error(
      "Supabase is not configured. Set the public URL, anon key, and server-only service role key.",
    );
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
