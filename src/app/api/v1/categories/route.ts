import { NextResponse } from "next/server";
import { getAllCategories } from "@/lib/stations-repository";
import db from "@/lib/db";

export async function GET() {
  try {
    const dbCategories = await db.category.findMany({
      orderBy: { nameEn: "asc" },
    });

    if (dbCategories.length > 0) {
      return NextResponse.json({ data: dbCategories });
    }
  } catch {
    // fallback to static
  }

  const fallback = getAllCategories();
  return NextResponse.json({ data: fallback });
}
