"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { useI18n } from "@/lib/i18n";
import {
  Radio,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Activity,
  Plus,
  RefreshCw,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function AdminOverviewPage() {
  const { t } = useI18n();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealthSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/health");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthSummary();
  }, []);

  return (
    <div className="space-y-6">
      <AdminHeader />

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
          <p className="text-xs text-[var(--foreground-muted)]">Loading administrative telemetry...</p>
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] shadow-xs">
              <span className="text-xs font-semibold text-[var(--foreground-muted)] block mb-1">
                {t.admin.totalStations}
              </span>
              <p className="text-3xl font-extrabold text-[var(--foreground)]">
                {data?.summary?.totalStations || 0}
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block">Curated + Database</span>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] shadow-xs">
              <span className="text-xs font-semibold text-emerald-400 block mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t.admin.playableCount}
              </span>
              <p className="text-3xl font-extrabold text-emerald-400">
                {data?.summary?.healthyCount || 0}
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block">HTTP 200 Stream Verified</span>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] shadow-xs">
              <span className="text-xs font-semibold text-amber-400 block mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {t.admin.degradedCount}
              </span>
              <p className="text-3xl font-extrabold text-amber-400">
                {data?.summary?.degradedCount || 0}
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block">Slow or High Latency</span>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] shadow-xs">
              <span className="text-xs font-semibold text-red-400 block mb-1 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                {t.admin.unavailableCount}
              </span>
              <p className="text-3xl font-extrabold text-red-400">
                {data?.summary?.unavailableCount || 0}
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block">Unreachable Streams</span>
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/stations"
              className="px-4 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t.admin.addStation}</span>
            </Link>

            <Link
              href="/admin/health"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--surface-border)] text-xs font-bold text-[var(--foreground)] flex items-center gap-2 transition-colors"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>{t.admin.health}</span>
            </Link>

            <button
              onClick={fetchHealthSummary}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--surface-border)] text-xs font-bold text-[var(--foreground)] flex items-center gap-2 transition-colors ml-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t.actions.refresh}</span>
            </button>
          </div>

          {/* Recent Health Telemetry Table */}
          <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--surface-border)] shadow-xs">
            <h3 className="font-bold text-sm text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Recent Stream Verification Checks</span>
            </h3>

            {(!data?.recentChecks || data.recentChecks.length === 0) ? (
              <p className="text-xs text-[var(--foreground-muted)] py-6 text-center">
                No health verification records yet. Run a check from the Stream Health tab.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--surface-border)] text-[var(--foreground-muted)]">
                      <th className="pb-3 font-semibold">Station</th>
                      <th className="pb-3 font-semibold">Result</th>
                      <th className="pb-3 font-semibold">HTTP Status</th>
                      <th className="pb-3 font-semibold">Latency</th>
                      <th className="pb-3 font-semibold">Checked At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--surface-border)]">
                    {data.recentChecks.slice(0, 8).map((chk: any) => (
                      <tr key={chk.id} className="hover:bg-white/5">
                        <td className="py-3 font-medium text-[var(--foreground)]">
                          {chk.endpoint?.station?.name || "Endpoint " + chk.endpointId.substring(0, 8)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              chk.result === "healthy"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : chk.result === "degraded"
                                ? "bg-amber-500/15 text-amber-400"
                                : "bg-red-500/15 text-red-400"
                            }`}
                          >
                            {chk.result.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 text-[var(--foreground-muted)]">{chk.httpStatus || "N/A"}</td>
                        <td className="py-3 text-[var(--foreground-muted)]">{chk.responseTimeMs ? `${chk.responseTimeMs}ms` : "-"}</td>
                        <td className="py-3 text-[var(--foreground-muted)]">
                          {new Date(chk.checkedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
