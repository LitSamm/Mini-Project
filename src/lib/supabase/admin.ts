import "server-only";

import { createClient } from "@supabase/supabase-js";
import { hasSupabaseServiceConfig } from "@/lib/supabase/config";

export function createAdminSupabaseClient() {
  if (!hasSupabaseServiceConfig()) {
    throw new Error(
      "Supabase service access is not configured. Set the project URL and server-only service role key.",
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
