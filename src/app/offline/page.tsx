"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { WifiOff, RefreshCw, Heart } from "lucide-react";

export default function OfflinePage() {
  const { t } = useI18n();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto p-6 rounded-3xl bg-[var(--surface)] border border-[var(--surface-border)] shadow-xl">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
        <WifiOff className="w-8 h-8" />
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">{t.pwa.offlineTitle}</h1>
      <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mt-2 leading-relaxed">
        {t.pwa.offlineDesc}
      </p>

      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full">
        <button
          onClick={handleRetry}
          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t.pwa.retryConnection}</span>
        </button>

        <Link
          href="/favorites"
          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--surface-border)] text-xs font-semibold text-[var(--foreground)] flex items-center justify-center gap-2 transition-colors"
        >
          <Heart className="w-4 h-4 text-red-500" />
          <span>View Favorites</span>
        </Link>
      </div>
    </div>
  );
}
