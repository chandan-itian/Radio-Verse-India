import { NextRequest, NextResponse } from "next/server";
import { getStations } from "@/lib/stations-repository";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") || "";
  if (!query.trim()) {
    return NextResponse.json({ data: [] });
  }

  const { stations } = await getStations({
    query: query.trim(),
    limit: 12,
  });

  return NextResponse.json({ data: stations });
}
