import { NextResponse } from "next/server";

import { getHomepageData } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || "1");
  const data = await getHomepageData(page);

  return NextResponse.json({
    items: data.items,
    page: data.page,
    pageSize: data.pageSize,
    total: data.total,
    totalPages: data.totalPages
  });
}
