import { NextRequest, NextResponse } from "next/server";
import { getStations } from "@/lib/stations-repository";
import { z } from "zod";

export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  query: z.string().optional(),
  language: z.string().optional(),
  state: z.string().optional(),
  category: z.string().optional(),
  sortBy: z.enum(["popular", "name", "recent"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(24),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = QuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { stations, total } = await getStations(parsed.data);

    return NextResponse.json(
      {
        data: stations,
        pagination: {
          page: parsed.data.page,
          limit: parsed.data.limit,
          total,
          totalPages: Math.ceil(total / parsed.data.limit),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /api/v1/stations error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
