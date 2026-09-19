import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookie, verifySession } from "@/lib/admin-auth";

export async function GET() {
  const cookieStore = await cookies();
  const valid = verifySession(cookieStore.get(adminCookie.name)?.value);
  return NextResponse.json({ authenticated: valid }, { status: valid ? 200 : 401 });
}
