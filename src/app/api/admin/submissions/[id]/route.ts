import { SubmissionStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { isAdminAuthorized } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorized = await isAdminAuthorized();

  if (!authorized) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const status = String(body.status || "").trim() as SubmissionStatus;

  if (!Object.values(SubmissionStatus).includes(status)) {
    return NextResponse.json({ error: "状态不合法" }, { status: 400 });
  }

  const updated = await prisma.talkSubmission.update({
    where: { id },
    data: {
      status,
      adminComment: String(body.adminComment || "").trim() || null
    }
  });

  return NextResponse.json(updated);
}
