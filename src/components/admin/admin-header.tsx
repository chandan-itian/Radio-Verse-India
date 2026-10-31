"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { LayoutDashboard, Radio, Activity, FileText, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/v1/admin/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/admin/login");
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data?.user) setAdminUser(data.user);
      })
      .catch(() => router.push("/admin/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/v1/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const tabs = [
    { href: "/admin", label: t.admin.overview, icon: LayoutDashboard },
    { href: "/admin/stations", label: t.admin.stations, icon: Radio },
    { href: "/admin/health", label: t.admin.health, icon: Activity },
    { href: "/admin/audit", label: t.admin.audit, icon: FileText },
  ];

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">{t.admin.title}</h2>
            {adminUser && (
              <p className="text-xs text-[var(--foreground-muted)]">
                Signed in as <span className="font-semibold text-white">{adminUser.email}</span> (
                <span className="text-amber-400 font-bold">{adminUser.role}</span>)
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t.admin.signOut}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap",
                isActive
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--foreground-muted)] border border-[var(--surface-border)]"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
