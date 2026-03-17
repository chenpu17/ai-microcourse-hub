import { NextResponse } from "next/server";
import { SubmissionStatus } from "@prisma/client";

import { isAdminAuthorized } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { parseEventDateInput, slugify, splitLines } from "@/lib/utils";

export async function POST(request: Request) {
  const authorized = await isAdminAuthorized();

  if (!authorized) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await request.json();
  const title = String(body.title || "").trim();
  const speakerName = String(body.speakerName || "").trim();
  const durationLabel = String(body.durationLabel || "").trim();
  const eventDateInput = String(body.eventDate || "").trim();
  const startTime = String(body.startTime || "").trim();
  const endTime = String(body.endTime || "").trim();
  const summary = String(body.summary || "").trim();
  const replayUrl = String(body.replayUrl || "").trim();
  const materialsUrl = splitLines(String(body.materialsUrl || "")).join("\n");
  const eventDate = parseEventDateInput(eventDateInput);

  if (
    !title ||
    !speakerName ||
    !durationLabel ||
    !eventDate ||
    !startTime ||
    !endTime ||
    !summary ||
    !replayUrl ||
    !materialsUrl
  ) {
    return NextResponse.json(
      { error: "标题、主讲人、时长、活动日期、起止时间、摘要、回放和资料链接必填。" },
      { status: 400 }
    );
  }

  if (endTime <= startTime) {
    return NextResponse.json({ error: "结束时间需要晚于开始时间。" }, { status: 400 });
  }

  const tags = String(body.tags || "")
    .split(",")
    .map((tag: string) => tag.trim())
    .filter(Boolean);
  const presetTags = Array.isArray(body.presetTags)
    ? body.presetTags.map((item: string) => String(item).trim()).filter(Boolean)
    : [];
  const relatedIds = Array.isArray(body.relatedIds)
    ? body.relatedIds.map((item: string) => String(item).trim()).filter(Boolean)
    : [];
  const sourceSubmissionId = String(body.sourceSubmissionId || "").trim();
  const mergedTags = Array.from(new Set([...presetTags, ...tags]));

  const course = await prisma.$transaction(async (tx) => {
    const createdCourse = await tx.microCourse.create({
      data: {
        slug: `${slugify(title)}-${Date.now().toString().slice(-4)}`,
        title,
        speakerName,
        durationLabel,
        eventDate,
        startTime,
        endTime,
        summary,
        replayUrl,
        materialsUrl,
        publishedAt: new Date(),
        cardColorType: String(body.cardColorType || "cream"),
        takeawaysText: splitLines(String(body.takeawaysText || "")).join("\n"),
        speakerBio: String(body.speakerBio || "").trim(),
        feedbackQuotesText: splitLines(String(body.feedbackQuotesText || "")).join("\n"),
        tags: {
          create: mergedTags.map((tagName) => ({ tagName }))
        },
        relatedFrom: {
          create: relatedIds.map((relatedCourseId: string) => ({ relatedCourseId }))
        }
      }
    });

    if (sourceSubmissionId) {
      await tx.talkSubmission.update({
        where: { id: sourceSubmissionId },
        data: {
          status: SubmissionStatus.ARCHIVED,
          adminComment: "已从这条报名直接生成历史微课归档。"
        }
      });
    }

    return tx.microCourse.findUniqueOrThrow({
      where: { id: createdCourse.id },
      include: { tags: true, relatedFrom: true }
    });
  });

  return NextResponse.json(course, { status: 201 });
}
