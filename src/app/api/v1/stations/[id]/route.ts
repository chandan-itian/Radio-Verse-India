import { NextRequest, NextResponse } from "next/server";
import { getStationById } from "@/lib/stations-repository";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing station ID" }, { status: 400 });
    }

    const station = await getStationById(id);
    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    return NextResponse.json(
      { data: station },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /api/v1/stations/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
