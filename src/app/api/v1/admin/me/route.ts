import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/auth/admin-auth";

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user: session });
}
