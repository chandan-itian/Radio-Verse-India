"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StationItem } from "@/types/station";
import { StationCard } from "@/components/station/station-card";
import { getLocalHistory, clearLocalHistory } from "@/lib/storage/preferences";
import { useI18n } from "@/lib/i18n";
import { History, Trash2, ArrowRight } from "lucide-react";

export default function RecentlyPlayedPage() {
  const { t } = useI18n();
  const [historyItems, setHistoryItems] = useState<Array<{ station: StationItem; playedAt: number }>>([]);
  const [mounted, setMounted] = useState(false);

  const loadHistory = () => {
    setHistoryItems(getLocalHistory());
  };

  useEffect(() => {
    loadHistory();
    setMounted(true);
  }, []);

  const handleClear = () => {
    if (confirm("Are you sure you want to clear your listening history?")) {
      clearLocalHistory();
      setHistoryItems([]);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <History className="w-5 h-5" />
            <span className="text-xs uppercase tracking-wider font-bold">Session History</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
            {t.history.title}
          </h1>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleClear}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.history.clearHistory}</span>
          </button>
        )}
      </div>

      {historyItems.length === 0 ? (
        <div className="py-24 text-center max-w-md mx-auto p-6 rounded-3xl bg-[var(--surface)] border border-[var(--surface-border)]">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">{t.history.emptyTitle}</h2>
          <p className="text-xs text-[var(--foreground-muted)] mt-1.5 leading-relaxed">
            {t.history.emptyDescription}
          </p>
          <Link
            href="/stations"
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold shadow-md hover:bg-[var(--primary-hover)] transition-colors"
          >
            <span>{t.favorites.exploreStations}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {historyItems.map((item) => (
            <div key={`${item.station.id}-${item.playedAt}`} className="flex flex-col">
              <StationCard station={item.station} variant="compact" />
              <span className="text-[10px] text-[var(--foreground-muted)] px-3 pt-1">
                Last played: {new Date(item.playedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
