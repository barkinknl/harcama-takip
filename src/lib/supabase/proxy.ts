import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
  "/privacy",
  "/terms",
  "/setup",
];

const isPublicPath = (pathname: string) =>
  PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Env yoksa: yalnızca /setup ve diğer public path'lere izin ver,
  // gerisini /setup'a yönlendir.
  if (!url || !key) {
    const { pathname } = request.nextUrl;
    if (pathname === "/setup" || isPublicPath(pathname)) {
      return response;
    }
    const setupUrl = request.nextUrl.clone();
    setupUrl.pathname = "/setup";
    setupUrl.search = "";
    return NextResponse.redirect(setupUrl);
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // ÖNEMLİ: getUser() çağrısı sessions'ı yeniler.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // /setup'a giriş yapan veya yapmamış herkes erişebilir,
  // yapılandırılmışsa setup'tan / sayfasına yönlendir
  if (pathname === "/setup") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  // Giriş yapmamış kullanıcı korumalı sayfaya gitmeye çalışıyorsa → /sign-in
  if (!user && !isPublicPath(pathname)) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/sign-in";
    signInUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Giriş yapmış kullanıcı auth sayfalarına gitmeye çalışıyorsa → /
  if (
    user &&
    (pathname.startsWith("/sign-in") ||
      pathname.startsWith("/sign-up") ||
      pathname.startsWith("/forgot-password"))
  ) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return response;
}
