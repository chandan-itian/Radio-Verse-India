"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { StationItem } from "@/types/station";
import { StationCard } from "@/components/station/station-card";
import { useI18n } from "@/lib/i18n";
import { getAllStations, filterStations } from "@/lib/stations-store";
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
  "Andhra Pradesh",
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
  const [sortBy, setSortBy] = useState<"popular" | "name" | "recent">(sortParam);

  const [stations, setStations] = useState<StationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sync state when URL search params change (e.g. from header search or back button)
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const l = searchParams.get("language") || "all";
    const s = searchParams.get("state") || "all";
    const c = searchParams.get("category") || "all";
    const so = (searchParams.get("sort") as any) || "popular";

    setQuery(q);
    setLanguage(l);
    setState(s);
    setCategory(c);
    setSortBy(so);

    executeFilter(q, l, s, c, so);
  }, [searchParams]);

  // Execute filtering instantly with local store + online API fallback
  const executeFilter = useCallback(
    (qVal: string, lVal: string, sVal: string, cVal: string, sortVal: "popular" | "name" | "recent") => {
      setLoading(true);

      // 1. Get complete catalog (Curated + Custom added stations)
      const all = getAllStations();
      const filtered = filterStations(all, {
        query: qVal,
        language: lVal,
        state: sVal,
        category: cVal,
        sortBy: sortVal,
      });

      setStations(filtered);
      setTotal(filtered.length);
      setLoading(false);

      // 2. Try background API call if online server exists
      try {
        const params = new URLSearchParams();
        if (qVal.trim()) params.set("query", qVal.trim());
        if (lVal !== "all") params.set("language", lVal);
        if (sVal !== "all") params.set("state", sVal);
        if (cVal !== "all") params.set("category", cVal);
        params.set("sortBy", sortVal);

        fetch(`/api/v1/stations?${params.toString()}`)
          .then((res) => {
            if (res.ok) return res.json();
            return null;
          })
          .then((json) => {
            if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
              // Merge server results if richer
              const serverList: StationItem[] = json.data;
              const merged = filterStations([...all, ...serverList], {
                query: qVal,
                language: lVal,
                state: sVal,
                category: cVal,
                sortBy: sortVal,
              });
              // Deduplicate by id
              const seen = new Set<string>();
              const unique: StationItem[] = [];
              for (const item of merged) {
                if (!seen.has(item.id)) {
                  seen.add(item.id);
                  unique.push(item);
                }
              }
              setStations(unique);
              setTotal(unique.length);
            }
          })
          .catch(() => {
            // Offline / static - local results are already displayed!
          });
      } catch {
        // ignore
      }
    },
    []
  );

  // Sync state with URL params
  const updateUrl = (newQuery: string, newLang: string, newState: string, newCat: string, newSort: string) => {
    const params = new URLSearchParams();
    if (newQuery.trim()) params.set("q", newQuery.trim());
    if (newLang !== "all") params.set("language", newLang);
    if (newState !== "all") params.set("state", newState);
    if (newCat !== "all") params.set("category", newCat);
    if (newSort !== "popular") params.set("sort", newSort);

    const queryString = params.toString();
    router.replace(`/stations${queryString ? `?${queryString}` : ""}`);
  };

  // Initial load and custom station event listener
  useEffect(() => {
    executeFilter(query, language, state, category, sortBy);

    const handleStationsUpdated = () => {
      executeFilter(query, language, state, category, sortBy);
    };

    window.addEventListener("radioverse_stations_updated", handleStationsUpdated);
    return () => {
      window.removeEventListener("radioverse_stations_updated", handleStationsUpdated);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(query, language, state, category, sortBy);
    executeFilter(query, language, state, category, sortBy);
  };

  const handleClearFilters = () => {
    setQuery("");
    setLanguage("all");
    setState("all");
    setCategory("all");
    setSortBy("popular");
    updateUrl("", "all", "all", "all", "popular");
    executeFilter("", "all", "all", "all", "popular");
  };

  const hasActiveFilters = query.trim() !== "" || language !== "all" || state !== "all" || category !== "all";

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
            onClick={handleSearchSubmit}
            className="px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>{t.actions.search}</span>
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
              onClick={() => executeFilter(query, language, state, category, sortBy)}
              className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--surface-border)] text-xs font-semibold text-[var(--foreground)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
