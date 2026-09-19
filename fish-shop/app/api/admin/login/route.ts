import { NextResponse } from "next/server";
import { adminCookie, createSession } from "@/lib/admin-auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) return NextResponse.json({ error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" }, { status: 400 });
    if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }
    const response = NextResponse.json({ success: true });
    response.cookies.set(adminCookie.name, createSession(), {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", path: "/", maxAge: adminCookie.maxAge,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "ข้อมูลเข้าสู่ระบบไม่ถูกต้อง" }, { status: 400 });
  }
}
