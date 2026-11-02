"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAdmin, type LoginState } from "@/app/admin/login/actions";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);

  return (
    <main className="admin-page admin-login-page">
      <section className="admin-login-card">
        <Link className="admin-back-link" href="/">← Kembali ke Anargya</Link>
        <p className="eyebrow">ANARGYA · STORE MANAGEMENT</p>
        <h1>Admin sign in</h1>
        <p className="admin-muted">Masuk untuk mengelola produk dan pesanan toko.</p>
        <Suspense fallback={null}>
          <AdminLoginNotice />
        </Suspense>
        <form action={formAction} className="admin-form">
          <label>
            Email admin
            <input autoComplete="username" name="email" required type="email" />
          </label>
          <label>
            Kata sandi
            <input autoComplete="current-password" name="password" required type="password" />
          </label>
          {state.error && <p className="admin-form-error" role="alert">{state.error}</p>}
          <button className="admin-primary-button" disabled={pending} type="submit">
            {pending ? "Memeriksa..." : "Masuk"}
          </button>
        </form>
        <p className="admin-security-note">
          Akun admin dibuat oleh pengelola melalui Supabase; pendaftaran publik tidak tersedia.
        </p>
      </section>
    </main>
  );
}

function AdminLoginNotice() {
  const searchParams = useSearchParams();
  const setupRequired = searchParams.get("setup") === "required";
  const unauthorized = searchParams.get("error") === "unauthorized";

  if (setupRequired) {
    return (
      <p className="admin-setup-notice" role="status">
        Admin belum dikonfigurasi. Isi kredensial Supabase dan allowlist admin di environment situs.
      </p>
    );
  }

  if (unauthorized) {
    return (
      <p className="admin-form-error" role="alert">
        Akun ini tidak memiliki akses admin. Gunakan email yang terdaftar pada allowlist.
      </p>
    );
  }

  return null;
}
