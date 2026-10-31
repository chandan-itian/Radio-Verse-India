import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  createAdminToken,
  verifyAdminToken,
  hasPermission,
  AdminSessionUser,
} from "../lib/auth/admin-auth";

describe("Admin Authentication & RBAC Security", () => {
  it("should securely hash and verify passwords using bcrypt", async () => {
    const rawPass = "SecureSuperAdminPass2026!";
    const hash = await hashPassword(rawPass);

    expect(hash).not.toBe(rawPass);
    expect(hash.startsWith("$2")).toBe(true);

    const isValid = await verifyPassword(rawPass, hash);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword("WrongPassword123", hash);
    expect(isInvalid).toBe(false);
  });

  it("should create and verify JWT admin session tokens", async () => {
    const user: AdminSessionUser = {
      id: "usr-admin-1",
      email: "admin@radioverse.in",
      name: "Super Administrator",
      role: "SUPER_ADMIN",
    };

    const token = await createAdminToken(user);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const verified = await verifyAdminToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe("usr-admin-1");
    expect(verified?.email).toBe("admin@radioverse.in");
    expect(verified?.role).toBe("SUPER_ADMIN");
  });

  it("should reject tampered JWT tokens", async () => {
    const user: AdminSessionUser = {
      id: "usr-admin-1",
      email: "admin@radioverse.in",
      name: "Admin",
      role: "ADMIN",
    };

    const token = await createAdminToken(user);
    const tampered = token.slice(0, -6) + "abcdef";

    const verified = await verifyAdminToken(tampered);
    expect(verified).toBeNull();
  });

  it("should enforce least privilege RBAC hierarchy correctly", () => {
    // SUPER_ADMIN (4) > ADMIN (3) > EDITOR (2) > VIEWER (1)
    expect(hasPermission("SUPER_ADMIN", "ADMIN")).toBe(true);
    expect(hasPermission("SUPER_ADMIN", "EDITOR")).toBe(true);
    expect(hasPermission("ADMIN", "EDITOR")).toBe(true);
    expect(hasPermission("ADMIN", "VIEWER")).toBe(true);
    expect(hasPermission("EDITOR", "VIEWER")).toBe(true);

    // Forbidden higher permissions
    expect(hasPermission("VIEWER", "EDITOR")).toBe(false);
    expect(hasPermission("VIEWER", "ADMIN")).toBe(false);
    expect(hasPermission("EDITOR", "ADMIN")).toBe(false);
    expect(hasPermission("ADMIN", "SUPER_ADMIN")).toBe(false);
  });
});
