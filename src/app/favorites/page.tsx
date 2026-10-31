"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StationItem } from "@/types/station";
import { StationCard } from "@/components/station/station-card";
import { getLocalFavorites, removeLocalFavorite } from "@/lib/storage/preferences";
import { useI18n } from "@/lib/i18n";
import { Heart, Search, ArrowRight, Trash2 } from "lucide-react";

export default function FavoritesPage() {
  const { t } = useI18n();
  const [favorites, setFavorites] = useState<StationItem[]>([]);
  const [searchVal, setSearchVal] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "language">("recent");
  const [mounted, setMounted] = useState(false);

  const loadFavorites = () => {
    setFavorites(getLocalFavorites());
  };

  useEffect(() => {
    loadFavorites();
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Filter and sort
  const filtered = favorites.filter((s) => {
    if (!searchVal.trim()) return true;
    const q = searchVal.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.language.toLowerCase().includes(q);
  });

  filtered.sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "language") return a.language.localeCompare(b.language);
    return 0; // Default order in storage is recent first
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-red-500 mb-1">
            <Heart className="w-5 h-5 fill-current" />
            <span className="text-xs uppercase tracking-wider font-bold">Personal Stash</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
            {t.favorites.title} ({favorites.length})
          </h1>
        </div>

        {favorites.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--surface-border)] text-xs text-[var(--foreground)] font-semibold"
            >
              <option value="recent">Recently Added</option>
              <option value="name">Station Name (A-Z)</option>
              <option value="language">Language</option>
            </select>
          </div>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="py-24 text-center max-w-md mx-auto p-6 rounded-3xl bg-[var(--surface)] border border-[var(--surface-border)]">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">{t.favorites.emptyTitle}</h2>
          <p className="text-xs text-[var(--foreground-muted)] mt-1.5 leading-relaxed">
            {t.favorites.emptyDescription}
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
        <>
          {/* Search inside favorites */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder={t.favorites.searchFavorites}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--foreground)] focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                variant="default"
                onFavoriteChange={loadFavorites}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
