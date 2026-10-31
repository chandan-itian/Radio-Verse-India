"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { useI18n } from "@/lib/i18n";
import { FileText, Loader2, RefreshCw } from "lucide-react";

export default function AdminAuditPage() {
  const { t } = useI18n();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/audit");
      if (res.ok) {
        const json = await res.json();
        setLogs(json.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <AdminHeader />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">{t.admin.audit}</h1>
          <p className="text-xs text-[var(--foreground-muted)]">
            Immutable records of all administrative actions, stream updates, and system mutations.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--surface-border)] text-xs font-semibold text-[var(--foreground)] self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
          <p className="text-xs text-[var(--foreground-muted)]">Loading audit ledger...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="py-20 text-center p-6 rounded-3xl bg-[var(--surface)] border border-[var(--surface-border)]">
          <p className="text-sm font-bold text-[var(--foreground)]">No administrative actions logged yet.</p>
        </div>
      ) : (
        <div className="rounded-3xl bg-[var(--surface)] border border-[var(--surface-border)] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-[var(--surface-border)] text-[var(--foreground-muted)]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Action</th>
                  <th className="py-3 px-4 font-semibold">Actor</th>
                  <th className="py-3 px-4 font-semibold">Target</th>
                  <th className="py-3 px-4 font-semibold">Details</th>
                  <th className="py-3 px-4 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--surface-border)]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-indigo-400 font-mono text-[11px]">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-[var(--foreground)]">{log.actorEmail}</td>
                    <td className="py-3 px-4 text-[var(--foreground-muted)]">
                      {log.targetType} {log.targetId ? `(${log.targetId.substring(0, 8)})` : ""}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-[var(--foreground-muted)] font-mono text-[10px]">
                      {log.metadata || "-"}
                    </td>
                    <td className="py-3 px-4 text-right text-[var(--foreground-muted)]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
