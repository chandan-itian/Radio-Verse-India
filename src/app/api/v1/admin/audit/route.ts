import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest, hasPermission } from "@/lib/auth/admin-auth";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session || !hasPermission(session.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden. Requires Admin or higher." }, { status: 403 });
  }

  try {
    const logs = await db.adminAuditLog.findMany({
      take: 50,
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json({ data: logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
