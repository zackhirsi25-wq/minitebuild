import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { resolveHost, sitePath } from "@/lib/routing/hostname";

// Next.js 16 calls middleware "proxy". Routes each request by hostname:
//   ROOT_DOMAIN, www, localhost, *.vercel.app -> the app (admin, previews, checkout)
//   <slug>.ROOT_DOMAIN                         -> that business's live site (/s/<slug>)
//   anything else                              -> a clean 404

const NOT_FOUND_PATH = "/_unknown-host";

export async function proxy(request: NextRequest) {
  const rootDomain = process.env.ROOT_DOMAIN ?? "localhost:3000";
  const target = resolveHost(request.headers.get("host"), rootDomain);
  const { pathname } = request.nextUrl;

  if (target.kind === "unknown") {
    return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url));
  }

  if (target.kind === "site") {
    const url = request.nextUrl.clone();
    url.pathname = sitePath(target.slug, pathname);
    return NextResponse.rewrite(url);
  }

  // App host. The internal site routes are only reachable through a subdomain.
  if (pathname === "/s" || pathname.startsWith("/s/")) {
    return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url));
  }

  let response = NextResponse.next({ request });
  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
    const session = await refreshSession(request);
    response = session.response;
    if (!session.signedIn && pathname.startsWith("/admin")) {
      // The admin layout checks the email too; this just saves a render.
      const redirect = NextResponse.redirect(new URL("/login", request.url));
      for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
      return redirect;
    }
  }
  if (/^\/(p|admin|admin-preview|login|billing)(\/|$)/.test(pathname)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

/** Keeps the Supabase auth cookies fresh (Supabase's documented proxy pattern). */
async function refreshSession(request: NextRequest): Promise<{ response: NextResponse; signedIn: boolean }> {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return { response, signedIn: false };

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  return { response, signedIn: !!data.user };
}

export const config = {
  matcher: [
    // Everything except API routes (they don't depend on the host: the worker
    // and webhooks authenticate themselves), Next internals and static files.
    "/((?!api/|_next/static|_next/image|stock/|favicon\\.ico|icon\\.svg).*)",
  ],
};
