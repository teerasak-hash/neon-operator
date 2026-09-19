import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/api/")) return NextResponse.next();
  if ((pathname === "/api/products" && request.method === "GET") || (pathname.startsWith("/api/products/") && request.method === "GET") || (pathname === "/api/orders" && request.method === "POST")) return NextResponse.next();
  const configuredToken = process.env.API_TOKEN;
  const authorization = request.headers.get("authorization");
  const suppliedToken = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!configuredToken || !suppliedToken || suppliedToken !== configuredToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.next();
}
export const config = { matcher: ["/api/:path*"] };