import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/auth/admin-auth";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const totalStations = await db.station.count();
    const endpoints = await db.streamEndpoint.findMany({
      include: {
        station: {
          select: { id: true, name: true, language: true, state: true, homepageUrl: true },
        },
        healthChecks: {
          take: 1,
          orderBy: { checkedAt: "desc" },
        },
      },
    });

    let healthyCount = 0;
    let degradedCount = 0;
    let unavailableCount = 0;
    let unknownCount = 0;

    for (const ep of endpoints) {
      if (ep.verificationStatus === "healthy") healthyCount++;
      else if (ep.verificationStatus === "degraded") degradedCount++;
      else if (ep.verificationStatus === "unavailable") unavailableCount++;
      else unknownCount++;
    }

    const recentChecks = await db.streamHealthCheck.findMany({
      take: 20,
      orderBy: { checkedAt: "desc" },
      include: {
        endpoint: {
          include: {
            station: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json({
      summary: {
        totalStations,
        totalEndpoints: endpoints.length,
        healthyCount,
        degradedCount,
        unavailableCount,
        unknownCount,
        lastVerificationTime: recentChecks[0]?.checkedAt || null,
      },
      endpoints,
      recentChecks,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
