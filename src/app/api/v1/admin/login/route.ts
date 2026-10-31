import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createAdminToken, logAdminAction } from "@/lib/auth/admin-auth";
import db from "@/lib/db";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid credentials format" }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || user.accountStatus !== "ACTIVE") {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await createAdminToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
    });

    await logAdminAction({
      actorId: user.id,
      actorEmail: user.email,
      action: "ADMIN_LOGIN",
      targetType: "User",
      targetId: user.id,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set("radioverse_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (err: any) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
