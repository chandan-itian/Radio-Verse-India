import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest, hasPermission, logAdminAction } from "@/lib/auth/admin-auth";
import { isSafeStreamHost } from "@/lib/monitoring/health-monitor";
import { slugify } from "@/lib/utils";
import db from "@/lib/db";
import { z } from "zod";

const ImportRowSchema = z.object({
  name: z.string().min(2),
  language: z.string().min(2),
  state: z.string().optional().nullable(),
  streamUrl: z.string().url(),
  homepageUrl: z.string().url().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  streamType: z.enum(["hls", "mp3", "aac", "unknown"]).default("unknown"),
});

const ImportPayloadSchema = z.object({
  stations: z.array(ImportRowSchema).min(1).max(100),
});

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session || !hasPermission(session.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden. Requires Admin or higher." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = ImportPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid import format", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { stations } = parsed.data;
    const results = {
      imported: 0,
      rejected: [] as Array<{ name: string; reason: string }>,
    };

    for (const item of stations) {
      // 1. SSRF Safety
      const safety = isSafeStreamHost(item.streamUrl);
      if (!safety.safe) {
        results.rejected.push({ name: item.name, reason: safety.reason || "Unsafe URL" });
        continue;
      }

      // 2. Duplicate check by name or streamUrl
      const existingName = await db.station.findFirst({
        where: { name: { equals: item.name.trim() } },
      });
      if (existingName) {
        results.rejected.push({ name: item.name, reason: "A station with this name already exists" });
        continue;
      }

      const existingEp = await db.streamEndpoint.findFirst({
        where: { streamUrl: item.streamUrl.trim() },
      });
      if (existingEp) {
        results.rejected.push({ name: item.name, reason: "Stream URL already registered" });
        continue;
      }

      // 3. Create station
      const slug = `${slugify(item.name)}-${Date.now().toString(36)}`;
      await db.$transaction(async (tx) => {
        const st = await tx.station.create({
          data: {
            name: item.name.trim(),
            slug,
            externalSource: "admin",
            language: item.language.toLowerCase().trim(),
            countryCode: "IN",
            state: item.state?.trim() || null,
            logoUrl: item.logoUrl || null,
            homepageUrl: item.homepageUrl || null,
            description: item.description || null,
            status: "active",
          },
        });

        await tx.streamEndpoint.create({
          data: {
            stationId: st.id,
            streamUrl: item.streamUrl.trim(),
            streamType: item.streamType,
            authorizationStatus: "verified_playable",
            verificationStatus: "unknown",
            priority: 1,
          },
        });
      });

      results.imported++;
    }

    await logAdminAction({
      actorId: session.id,
      actorEmail: session.email,
      action: "STATION_BULK_IMPORT",
      targetType: "Station",
      metadata: { imported: results.imported, rejectedCount: results.rejected.length },
    });

    return NextResponse.json({ success: true, ...results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
