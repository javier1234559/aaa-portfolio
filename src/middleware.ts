import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "portfolio_session";
const SESSION_VALUE = "ok";

function isPublicClientPortalPath(pathname: string): boolean {
  // `/app/publish/<slug>` — shareable read-only view (not `/app/publish` list).
  const parts = pathname.split("/").filter(Boolean);
  return parts.length === 3 && parts[0] === "app" && parts[1] === "publish" && parts[2] !== "";
}

export function middleware(request: NextRequest) {
  if (isPublicClientPortalPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SESSION_COOKIE);
  if (session?.value !== SESSION_VALUE) {
    const login = new URL("/login", request.url);
    login.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app", "/app/:path*"],
};
