import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest, hasPermission, logAdminAction } from "@/lib/auth/admin-auth";
import { isSafeStreamHost } from "@/lib/monitoring/health-monitor";
import { slugify } from "@/lib/utils";
import db from "@/lib/db";
import { z } from "zod";

const CreateStationSchema = z.object({
  name: z.string().min(2),
  language: z.string().min(2),
  countryCode: z.string().default("IN"),
  state: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  homepageUrl: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  categories: z.array(z.string()).default([]),
  streamUrl: z.string().url(),
  streamType: z.enum(["hls", "mp3", "aac", "unknown"]).default("unknown"),
  codec: z.string().optional().nullable(),
  bitrate: z.number().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const skip = (page - 1) * limit;

  try {
    const [stations, total] = await Promise.all([
      db.station.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          endpoints: {
            include: {
              healthChecks: {
                take: 1,
                orderBy: { checkedAt: "desc" },
              },
            },
          },
          categories: {
            include: { category: true },
          },
        },
      }),
      db.station.count(),
    ]);

    return NextResponse.json({
      data: stations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session || !hasPermission(session.role, "EDITOR")) {
    return NextResponse.json({ error: "Forbidden. Requires Editor or higher." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = CreateStationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const data = parsed.data;

    // SSRF Check
    const safety = isSafeStreamHost(data.streamUrl);
    if (!safety.safe) {
      return NextResponse.json({ error: `Unsafe stream URL: ${safety.reason}` }, { status: 400 });
    }

    const slug = `${slugify(data.name)}-${Date.now().toString(36)}`;

    const station = await db.$transaction(async (tx) => {
      const st = await tx.station.create({
        data: {
          name: data.name,
          slug,
          externalSource: "admin",
          language: data.language.toLowerCase(),
          countryCode: data.countryCode.toUpperCase(),
          state: data.state || null,
          logoUrl: data.logoUrl || null,
          homepageUrl: data.homepageUrl || null,
          description: data.description || null,
          isFeatured: data.isFeatured,
          status: "active",
        },
      });

      await tx.streamEndpoint.create({
        data: {
          stationId: st.id,
          streamUrl: data.streamUrl,
          streamType: data.streamType,
          codec: data.codec || null,
          bitrate: data.bitrate || null,
          authorizationStatus: "verified_playable",
          verificationStatus: "unknown",
          priority: 1,
        },
      });

      // Categories
      for (const catSlug of data.categories) {
        const cat = await tx.category.findUnique({ where: { slug: catSlug } });
        if (cat) {
          await tx.stationCategory.create({
            data: {
              stationId: st.id,
              categoryId: cat.id,
            },
          });
        }
      }

      return st;
    });

    await logAdminAction({
      actorId: session.id,
      actorEmail: session.email,
      action: "STATION_CREATE",
      targetType: "Station",
      targetId: station.id,
      metadata: { name: station.name, streamUrl: data.streamUrl },
    });

    return NextResponse.json({ success: true, data: station }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/v1/admin/stations error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
