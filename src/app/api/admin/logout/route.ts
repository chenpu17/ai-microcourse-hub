import { NextResponse } from "next/server";

import { getAdminAuthMode, getAdminCookieName } from "@/lib/admin";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  if (getAdminAuthMode() === "password") {
    response.cookies.delete(getAdminCookieName());
  }

  return response;
}
