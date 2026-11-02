import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseAuthConfig, isAdminEmail } from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!hasSupabaseAuthConfig()) {
    return isLoginPage
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/admin/login?setup=required", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          response = NextResponse.next({ request });

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  const isAdmin = !error && isAdminEmail(user?.email);

  if (isLoginPage && isAdmin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (!isLoginPage && !isAdmin) {
    return NextResponse.redirect(new URL("/admin/login?error=unauthorized", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
