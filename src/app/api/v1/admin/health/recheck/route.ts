import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest, hasPermission, logAdminAction } from "@/lib/auth/admin-auth";
import { runAndSaveHealthCheck } from "@/lib/monitoring/health-monitor";
import db from "@/lib/db";
import { z } from "zod";

const RecheckSchema = z.object({
  endpointId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session || !hasPermission(session.role, "EDITOR")) {
    return NextResponse.json({ error: "Forbidden. Requires Editor or higher." }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = RecheckSchema.safeParse(body);
    const endpointId = parsed.success ? parsed.data.endpointId : undefined;

    if (endpointId) {
      // Recheck single endpoint
      const ep = await db.streamEndpoint.findUnique({ where: { id: endpointId } });
      if (!ep) {
        return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
      }

      const result = await runAndSaveHealthCheck(ep.id, ep.streamUrl);

      await logAdminAction({
        actorId: session.id,
        actorEmail: session.email,
        action: "HEALTH_RECHECK_SINGLE",
        targetType: "StreamEndpoint",
        targetId: ep.id,
        metadata: { result: result.result, responseTimeMs: result.responseTimeMs },
      });

      return NextResponse.json({ success: true, result });
    } else {
      // Recheck batch (first 10 endpoints to prevent overload)
      const endpoints = await db.streamEndpoint.findMany({ take: 10 });
      const results = [];

      for (const ep of endpoints) {
        const res = await runAndSaveHealthCheck(ep.id, ep.streamUrl);
        results.push(res);
      }

      await logAdminAction({
        actorId: session.id,
        actorEmail: session.email,
        action: "HEALTH_RECHECK_BATCH",
        targetType: "StreamEndpoint",
        metadata: { count: results.length },
      });

      return NextResponse.json({ success: true, checkedCount: results.length, results });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
