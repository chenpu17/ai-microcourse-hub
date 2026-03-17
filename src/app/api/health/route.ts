import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const courseCount = await prisma.microCourse.count();
  const submissionCount = await prisma.talkSubmission.count();

  return NextResponse.json({
    ok: true,
    service: "ai-microcourse-hub",
    courseCount,
    submissionCount,
    timestamp: new Date().toISOString()
  });
}
