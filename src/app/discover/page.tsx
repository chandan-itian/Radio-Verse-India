"use client";

import React, { useState, useEffect } from "react";
import { StationItem } from "@/types/station";
import { StationCard } from "@/components/station/station-card";
import { getLocalFavorites, getLocalHistory } from "@/lib/storage/preferences";
import { useI18n } from "@/lib/i18n";
import { Compass, Sparkles, History, Flame, ArrowRight } from "lucide-react";
import Link from "next/link";

import { getAllStations } from "@/lib/stations-store";

export default function DiscoverPage() {
  const { t } = useI18n();
  const [favorites, setFavorites] = useState<StationItem[]>([]);
  const [history, setHistory] = useState<StationItem[]>([]);
  const [trending, setTrending] = useState<StationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setFavorites(getLocalFavorites());
    setHistory(getLocalHistory().map((h) => h.station));

    // Fallback featured from all stations
    const localFeatured = getAllStations().filter((s) => s.isFeatured);
    setTrending(localFeatured);

    // Fetch trending from API if available
    fetch("/api/v1/featured")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((json) => {
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          setTrending(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Determine top preferred language from history/favorites
  const allSaved = [...favorites, ...history];
  const langCounts: Record<string, number> = {};
  for (const s of allSaved) {
    langCounts[s.language] = (langCounts[s.language] || 0) + 1;
  }
  const preferredLang = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "hindi";

  return (
    <div className="space-y-10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 text-xs font-semibold mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>Smart Listening Radar</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
          Personalized Discovery
        </h1>
        <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mt-1">
          Handcrafted recommendations tuned to your language habits and favorite stations.
        </p>
      </div>

      {/* Recommended for You based on language */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] capitalize">
              Recommended for You ({preferredLang})
            </h2>
          </div>
          <Link
            href={`/languages/${preferredLang}`}
            className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
          >
            Explore {preferredLang} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {trending.slice(0, 4).map((station) => (
            <StationCard key={station.id} station={station} variant="default" />
          ))}
        </div>
      </section>

      {/* Jump back into favorites */}
      {favorites.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">Your Pinned Favorites</h2>
            <Link href="/favorites" className="text-xs font-semibold text-indigo-400 hover:underline">
              View all ({favorites.length})
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {favorites.slice(0, 6).map((station) => (
              <StationCard key={station.id} station={station} variant="compact" />
            ))}
          </div>
        </section>
      )}

      {/* Trending across India */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">Trending Today in India</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {trending.slice(2, 6).map((station) => (
            <StationCard key={station.id} station={station} variant="default" />
          ))}
        </div>
      </section>
    </div>
  );
}
