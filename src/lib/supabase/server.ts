import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hasSupabaseAuthConfig } from "@/lib/supabase/config";

export async function createSupabaseServerClient() {
  if (!hasSupabaseAuthConfig()) {
    throw new Error("Supabase authentication is not configured.");
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    },
  );
}

export async function getAdminUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Could not verify the admin session: ${error.message}`);
  }

  return user;
}
