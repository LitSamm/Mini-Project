"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseAuthConfig, isAdminEmail } from "@/lib/supabase/config";

export type LoginState = {
  error?: string;
};

export async function loginAdmin(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!hasSupabaseAuthConfig() || !process.env.SUPABASE_ADMIN_EMAILS) {
    return { error: "Autentikasi admin belum dikonfigurasi. Hubungi pengelola situs." };
  }

  if (!email || !password || !isAdminEmail(email)) {
    return { error: "Email atau kata sandi tidak valid." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !isAdminEmail(data.user?.email)) {
    if (data.user) {
      await supabase.auth.signOut();
    }

    return { error: "Email atau kata sandi tidak valid." };
  }

  redirect("/admin");
}
