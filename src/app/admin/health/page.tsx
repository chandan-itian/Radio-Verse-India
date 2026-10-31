"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { useI18n } from "@/lib/i18n";
import { Activity, RefreshCw, Loader2, ShieldAlert, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export default function AdminHealthPage() {
  const { t } = useI18n();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recheckingId, setRecheckingId] = useState<string | null>(null);
  const [batchRechecking, setBatchRechecking] = useState(false);

  const fetchHealth = async () => {
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
    fetchHealth();
  }, []);

  const handleRecheckSingle = async (endpointId: string) => {
    setRecheckingId(endpointId);
    try {
      const res = await fetch("/api/v1/admin/health/recheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpointId }),
      });
      if (res.ok) {
        await fetchHealth();
      }
    } catch {
      alert("Health recheck failed");
    } finally {
      setRecheckingId(null);
    }
  };

  const handleBatchRecheck = async () => {
    setBatchRechecking(true);
    try {
      const res = await fetch("/api/v1/admin/health/recheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        await fetchHealth();
      }
    } catch {
      alert("Batch health recheck failed");
    } finally {
      setBatchRechecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">{t.admin.health}</h1>
          <p className="text-xs text-[var(--foreground-muted)]">
            Continuous background telemetry. Inspects reachability, audio content-type, latency, and SSRF status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBatchRecheck}
            disabled={batchRechecking}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            {batchRechecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
            <span>Recheck First 10 Streams</span>
          </button>

          <button
            onClick={fetchHealth}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--surface-border)] text-xs font-semibold text-[var(--foreground)]"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
          <p className="text-xs text-[var(--foreground-muted)]">Checking stream endpoints...</p>
        </div>
      ) : (
        <div className="rounded-3xl bg-[var(--surface)] border border-[var(--surface-border)] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-[var(--surface-border)] text-[var(--foreground-muted)]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Station Name</th>
                  <th className="py-3 px-4 font-semibold">Stream URL</th>
                  <th className="py-3 px-4 font-semibold">Verification Status</th>
                  <th className="py-3 px-4 font-semibold">Diagnostic Summary</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--surface-border)]">
                {data?.endpoints?.map((ep: any) => {
                  const lastCheck = ep.healthChecks?.[0];
                  return (
                    <tr key={ep.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-bold text-[var(--foreground)]">
                        {ep.station?.name || "Unknown Station"}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-[var(--foreground-muted)] font-mono text-[11px]">
                        {ep.streamUrl}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                            ep.verificationStatus === "healthy"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : ep.verificationStatus === "degraded"
                              ? "bg-amber-500/15 text-amber-400"
                              : ep.verificationStatus === "unavailable"
                              ? "bg-red-500/15 text-red-400"
                              : "bg-slate-500/15 text-slate-400"
                          }`}
                        >
                          {ep.verificationStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-[var(--foreground-muted)] max-w-sm truncate">
                        {lastCheck?.diagnosticSummary || "No check recorded yet"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleRecheckSingle(ep.id)}
                          disabled={recheckingId === ep.id}
                          className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[var(--foreground)] transition-colors disabled:opacity-50"
                        >
                          {recheckingId === ep.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                          ) : (
                            "Verify"
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
