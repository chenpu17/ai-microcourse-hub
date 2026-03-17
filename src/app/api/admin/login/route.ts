import { NextResponse } from "next/server";

import { getAdminAuthMode, getAdminCookieName } from "@/lib/admin";

export async function POST(request: Request) {
  if (getAdminAuthMode() !== "password") {
    return NextResponse.json(
      { error: "当前环境启用了内网透传认证，不支持口令登录。" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const password = String(body.password || "");

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "管理员口令不对。" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(getAdminCookieName(), password, {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });

  return response;
}
