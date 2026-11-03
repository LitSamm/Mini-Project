export function hasSupabaseAuthConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL
    && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function hasSupabaseAdminConfig() {
  return hasSupabaseAuthConfig() && hasSupabaseServiceConfig();
}

export function hasSupabaseServiceConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL
    && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function hasStoreDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL);
}

export function hasMerchandiseStoreConfig() {
  return hasSupabaseAdminConfig() && hasStoreDatabaseConfig();
}

export function hasMerchandiseCheckoutConfig() {
  return hasSupabaseServiceConfig();
}

export function getAdminEmails() {
  return (process.env.SUPABASE_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | undefined) {
  return Boolean(email && getAdminEmails().includes(email.toLowerCase()));
}
