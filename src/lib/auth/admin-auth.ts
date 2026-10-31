import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import db from "../db";

function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET || "radioverse-india-fallback-secret-key-change-in-prod";
  return new Uint8Array(Buffer.from(secret, "utf-8"));
}

const COOKIE_NAME = "radioverse_admin_session";

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "VIEWER";

export interface AdminSessionUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createAdminToken(user: AdminSessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecretKey());
}

export async function verifyAdminToken(token: string): Promise<AdminSessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as AdminRole,
    };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyAdminToken(token);
  } catch {
    return null;
  }
}

export async function getAdminSessionFromRequest(req: NextRequest): Promise<AdminSessionUser | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function logAdminAction(params: {
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: any;
}) {
  try {
    await db.adminAuditLog.create({
      data: {
        actorId: params.actorId,
        actorEmail: params.actorEmail,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

export const ROLE_HIERARCHY: Record<AdminRole, number> = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  EDITOR: 2,
  VIEWER: 1,
};

export function hasPermission(userRole: AdminRole, requiredRole: AdminRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
