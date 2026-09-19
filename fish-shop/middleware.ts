import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminCookie, verifySession } from "@/lib/admin-auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/api/")) return NextResponse.next();

  if (
    (pathname === "/api/products" && request.method === "GET") ||
    (pathname.startsWith("/api/products/") && request.method === "GET") ||
    (pathname === "/api/orders" && request.method === "POST") ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout" ||
    pathname === "/api/admin/session"
  ) return NextResponse.next();

  if (!verifySession(request.cookies.get(adminCookie.name)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = { matcher: ["/api/:path*"] };
