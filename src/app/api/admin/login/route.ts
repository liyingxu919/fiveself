import { NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "fiveself2026";

export async function POST(request: Request) {
  const { password } = await request.json();
  if (password === ADMIN_PASSWORD) {
    const resp = NextResponse.json({ success: true });
    resp.cookies.set("admin_token", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });
    return resp;
  }
  return NextResponse.json({ error: "密码错误" }, { status: 401 });
}
