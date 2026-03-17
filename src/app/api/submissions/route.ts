import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const topic = String(body.topic || "").trim();
  const speakerName = String(body.speakerName || "").trim();
  const durationLabel = String(body.durationLabel || "").trim();
  const note = String(body.note || "").trim();

  if (!topic || !speakerName || !durationLabel) {
    return NextResponse.json(
      { error: "议题、姓名和时长都要填一下。" },
      { status: 400 }
    );
  }

  const submission = await prisma.talkSubmission.create({
    data: {
      topic,
      speakerName,
      durationLabel,
      note: note || null
    }
  });

  return NextResponse.json(submission, { status: 201 });
}
