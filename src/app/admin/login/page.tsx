"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { ShieldCheck, Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed.");
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setError("Network error while attempting sign in.");
      setLoading(false);
    }
  };

  return (
    <div className="py-16 flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-3xl bg-[var(--surface)] border border-[var(--surface-border)] shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-xl font-extrabold text-[var(--foreground)]">{t.admin.loginTitle}</h1>
          <p className="text-xs text-[var(--foreground-muted)] mt-1">{t.admin.loginSubtitle}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[var(--foreground)] block mb-1">
              {t.admin.email}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@radioverse.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-[var(--background)] border border-[var(--surface-border)] text-[var(--foreground)] focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--foreground)] block mb-1">
              {t.admin.password}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-[var(--background)] border border-[var(--surface-border)] text-[var(--foreground)] focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{t.admin.signIn}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[var(--surface-border)] text-center">
          <p className="text-[11px] text-[var(--foreground-muted)]">
            Default SuperAdmin: <span className="font-mono text-slate-400">admin@radioverse.in</span>
          </p>
        </div>
      </div>
    </div>
  );
}
