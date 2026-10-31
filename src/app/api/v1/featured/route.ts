import { NextResponse } from "next/server";
import { getFeaturedStations } from "@/lib/stations-repository";

export async function GET() {
  const featured = getFeaturedStations();
  return NextResponse.json({ data: featured });
}
