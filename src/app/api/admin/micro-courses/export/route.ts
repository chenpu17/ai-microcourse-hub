import { NextResponse } from "next/server";

import { isAdminAuthorized } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatDate, formatTimeRange, splitLines } from "@/lib/utils";

function escapeCsvCell(value: string) {
  const normalized = value.replace(/\r?\n/g, " / ");

  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
}

export async function GET() {
  const authorized = await isAdminAuthorized();

  if (!authorized) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const courses = await prisma.microCourse.findMany({
    include: { tags: true },
    orderBy: [{ eventDate: "desc" }, { publishedAt: "desc" }]
  });

  const rows = [
    [
      "主题",
      "主讲人",
      "活动日期",
      "开始时间",
      "结束时间",
      "时间段",
      "时长",
      "标签",
      "资料数",
      "资料链接",
      "回放链接",
      "详情页",
      "归档时间"
    ],
    ...courses.map((course) => {
      const materialLinks = splitLines(course.materialsUrl);

      return [
        course.title,
        course.speakerName,
        course.eventDate ? formatDate(course.eventDate) : "",
        course.startTime || "",
        course.endTime || "",
        formatTimeRange(course.startTime, course.endTime),
        course.durationLabel,
        course.tags.map((tag) => tag.tagName).join(" / "),
        String(materialLinks.length),
        materialLinks.join(" | "),
        course.replayUrl,
        `/micro-courses/${course.slug}`,
        formatDate(course.publishedAt)
      ];
    })
  ];

  const csv = `\uFEFF${rows
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\n")}`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="ai-microwave-ledger.csv"'
    }
  });
}
