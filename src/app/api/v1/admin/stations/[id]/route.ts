import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest, hasPermission, logAdminAction } from "@/lib/auth/admin-auth";
import { isSafeStreamHost } from "@/lib/monitoring/health-monitor";
import db from "@/lib/db";
import { z } from "zod";

const UpdateStationSchema = z.object({
  name: z.string().min(2).optional(),
  language: z.string().min(2).optional(),
  state: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  homepageUrl: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.enum(["active", "disabled", "restricted"]).optional(),
  isFeatured: z.boolean().optional(),
  streamUrl: z.string().url().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSessionFromRequest(req);
  if (!session || !hasPermission(session.role, "EDITOR")) {
    return NextResponse.json({ error: "Forbidden. Requires Editor or higher." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = UpdateStationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error", details: parsed.error.format() }, { status: 400 });
    }

    const data = parsed.data;

    if (data.streamUrl) {
      const safety = isSafeStreamHost(data.streamUrl);
      if (!safety.safe) {
        return NextResponse.json({ error: `Unsafe stream URL: ${safety.reason}` }, { status: 400 });
      }
    }

    const updated = await db.$transaction(async (tx) => {
      const st = await tx.station.update({
        where: { id },
        data: {
          name: data.name,
          language: data.language?.toLowerCase(),
          state: data.state,
          logoUrl: data.logoUrl,
          homepageUrl: data.homepageUrl,
          description: data.description,
          status: data.status,
          isFeatured: data.isFeatured,
        },
      });

      if (data.streamUrl) {
        const firstEp = await tx.streamEndpoint.findFirst({ where: { stationId: id } });
        if (firstEp) {
          await tx.streamEndpoint.update({
            where: { id: firstEp.id },
            data: { streamUrl: data.streamUrl },
          });
        }
      }

      return st;
    });

    await logAdminAction({
      actorId: session.id,
      actorEmail: session.email,
      action: "STATION_UPDATE",
      targetType: "Station",
      targetId: id,
      metadata: data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSessionFromRequest(req);
  if (!session || !hasPermission(session.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden. Requires Admin or higher." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const station = await db.station.findUnique({ where: { id } });
    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    await db.station.delete({ where: { id } });

    await logAdminAction({
      actorId: session.id,
      actorEmail: session.email,
      action: "STATION_DELETE",
      targetType: "Station",
      targetId: id,
      metadata: { name: station.name },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
