import { NextResponse } from "next/server";

import { getCourseBySlug } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return NextResponse.json({ error: "未找到该微课" }, { status: 404 });
  }

  return NextResponse.json(course);
}
