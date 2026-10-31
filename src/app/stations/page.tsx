"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { StationItem } from "@/types/station";
import { StationCard } from "@/components/station/station-card";
import { useI18n } from "@/lib/i18n";
import { Search, Filter, Loader2, X, RefreshCw } from "lucide-react";

const INDIAN_LANGUAGES = [
  "all",
  "hindi",
  "punjabi",
  "bhojpuri",
  "tamil",
  "telugu",
  "bengali",
  "kannada",
  "marathi",
  "malayalam",
  "gujarati",
  "odia",
  "english",
];

const INDIAN_STATES = [
  "all",
  "Delhi NCR",
  "Maharashtra",
  "Punjab",
  "Bihar",
  "Karnataka",
  "Tamil Nadu",
  "West Bengal",
  "Kerala",
  "Gujarat",
  "Uttar Pradesh",
];

function StationsDirectory() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, interpolate } = useI18n();

  const queryParam = searchParams.get("q") || "";
  const langParam = searchParams.get("language") || "all";
  const stateParam = searchParams.get("state") || "all";
  const catParam = searchParams.get("category") || "all";
  const sortParam = (searchParams.get("sort") as any) || "popular";

  const [query, setQuery] = useState(queryParam);
  const [language, setLanguage] = useState(langParam);
  const [state, setState] = useState(stateParam);
  const [category, setCategory] = useState(catParam);
  const [sortBy, setSortBy] = useState(sortParam);

  const [stations, setStations] = useState<StationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sync state with URL params
  const updateUrl = (newQuery: string, newLang: string, newState: string, newCat: string, newSort: string) => {
    const params = new URLSearchParams();
    if (newQuery) params.set("q", newQuery);
    if (newLang !== "all") params.set("language", newLang);
    if (newState !== "all") params.set("state", newState);
    if (newCat !== "all") params.set("category", newCat);
    if (newSort !== "popular") params.set("sort", newSort);

    router.replace(`/stations?${params.toString()}`);
  };

  const fetchStations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("query", query.trim());
      if (language !== "all") params.set("language", language);
      if (state !== "all") params.set("state", state);
      if (category !== "all") params.set("category", category);
      params.set("sortBy", sortBy);
      params.set("limit", "48");

      const res = await fetch(`/api/v1/stations?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setStations(json.data || []);
        setTotal(json.pagination?.total || 0);
      }
    } catch (err) {
      console.warn("Failed to load stations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, [language, state, category, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(query, language, state, category, sortBy);
    fetchStations();
  };

  const handleClearFilters = () => {
    setQuery("");
    setLanguage("all");
    setState("all");
    setCategory("all");
    setSortBy("popular");
    updateUrl("", "all", "all", "all", "popular");
  };

  const hasActiveFilters = query || language !== "all" || state !== "all" || category !== "all";

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">{t.nav.stations}</h1>
          <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mt-1">
            {interpolate(t.search.stationsCount, { count: total })}
          </p>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>{t.actions.clear}</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.search.placeholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-[var(--background)] border border-[var(--surface-border)] text-[var(--foreground)] focus:outline-hidden focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-xs sm:text-sm shadow-md transition-colors"
          >
            {t.actions.search}
          </button>
        </form>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[var(--surface-border)]">
          {/* Language select */}
          <div>
            <label className="text-[11px] font-semibold text-[var(--foreground-muted)] block mb-1">
              {t.search.filterByLanguage}
            </label>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                updateUrl(query, e.target.value, state, category, sortBy);
              }}
              aria-label={t.search.filterByLanguage}
              className="w-full px-2.5 py-1.5 rounded-xl bg-[var(--background)] border border-[var(--surface-border)] text-xs text-[var(--foreground)] font-medium capitalize"
            >
              {INDIAN_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === "all" ? t.search.allLanguages : lang}
                </option>
              ))}
            </select>
          </div>

          {/* State select */}
          <div>
            <label className="text-[11px] font-semibold text-[var(--foreground-muted)] block mb-1">
              {t.search.filterByState}
            </label>
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                updateUrl(query, language, e.target.value, category, sortBy);
              }}
              aria-label={t.search.filterByState}
              className="w-full px-2.5 py-1.5 rounded-xl bg-[var(--background)] border border-[var(--surface-border)] text-xs text-[var(--foreground)] font-medium"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st === "all" ? t.search.allStates : st}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[11px] font-semibold text-[var(--foreground-muted)] block mb-1">
              {t.search.sortBy}
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                updateUrl(query, language, state, category, e.target.value);
              }}
              aria-label={t.search.sortBy}
              className="w-full px-2.5 py-1.5 rounded-xl bg-[var(--background)] border border-[var(--surface-border)] text-xs text-[var(--foreground)] font-medium"
            >
              <option value="popular">{t.search.sortPopular}</option>
              <option value="name">{t.search.sortName}</option>
              <option value="recent">{t.search.sortRecent}</option>
            </select>
          </div>

          {/* Refresh action */}
          <div className="flex items-end">
            <button
              onClick={() => fetchStations()}
              className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--surface-border)] text-xs font-semibold text-[var(--foreground)] flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.actions.refresh}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Results */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[var(--foreground-muted)]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
          <p className="text-sm">{t.player.connecting}</p>
        </div>
      ) : stations.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto">
          <p className="text-base font-bold text-[var(--foreground)]">{t.search.noResults}</p>
          <p className="text-xs text-[var(--foreground-muted)] mt-1 leading-relaxed">
            {t.search.tryAnother}
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold shadow-xs"
          >
            {t.actions.clear}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {stations.map((station) => (
            <StationCard key={station.id} station={station} variant="default" />
          ))}
        </div>
      )}
    </div>
  );
}

export default function StationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading station directory...</div>}>
      <StationsDirectory />
    </Suspense>
  );
}
