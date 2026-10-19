import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (request.cookies.has("access_token")) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
  return NextResponse.redirect(url);
}

// literal list required by Next; mirrors GUARDED_PREFIXES in src/lib/guarded-routes.ts
export const config = { matcher: ["/cart", "/checkout", "/account/:path*", "/admin/:path*"] };
