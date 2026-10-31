import { getStations, getFeaturedStations, getAllCategories } from "@/lib/stations-repository";
import { StationCard } from "@/components/station/station-card";
import Link from "next/link";
import { Radio, Sparkles, Compass, ArrowRight, Flame } from "lucide-react";


export default async function HomePage() {
  const featured = getFeaturedStations();
  const { stations: popularStations } = await getStations({ limit: 8, sortBy: "popular" });
  const { stations: regionalStations } = await getStations({ limit: 6, sortBy: "recent" });
  const categories = getAllCategories();

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/20 p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold mb-4">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-live-pulse" />
            <span>India's Live Radio Universe</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            One Universe. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Every Indian Radio.
            </span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Stream live verified radio stations from All India Radio, Vividh Bharati, Radio Mirchi, and regional broadcasts in Hindi, Tamil, Telugu, Punjabi, Bhojpuri, and English.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/stations"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2"
            >
              <span>Explore All Stations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/discover"
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/10 transition-colors"
            >
              Personalized Discovery
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      </section>

      {/* Featured Stations Section */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-[var(--foreground)]">Featured Broadcasters</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {featured.slice(0, 4).map((station) => (
              <StationCard key={station.id} station={station} variant="featured" />
            ))}
          </div>
        </section>
      )}

      {/* Quick Language Discovery */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[var(--foreground)]">Browse by Language</h2>
          <Link href="/languages" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "hindi", label: "हिन्दी (Hindi)" },
            { id: "punjabi", label: "ਪੰਜਾਬੀ (Punjabi)" },
            { id: "tamil", label: "தமிழ் (Tamil)" },
            { id: "bhojpuri", label: "भोजपुरी (Bhojpuri)" },
            { id: "bengali", label: "বাংলা (Bengali)" },
            { id: "kannada", label: "ಕನ್ನಡ (Kannada)" },
            { id: "marathi", label: "मराठी (Marathi)" },
            { id: "telugu", label: "తెలుగు (Telugu)" },
            { id: "english", label: "English" },
          ].map((lang) => (
            <Link
              key={lang.id}
              href={`/languages/${lang.id}`}
              className="px-4 py-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] hover:border-indigo-500/50 text-xs font-semibold text-[var(--foreground)] whitespace-nowrap transition-all shadow-xs"
            >
              {lang.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Live Stations Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-[var(--foreground)]">Popular Live Stations</h2>
          </div>
          <Link href="/stations?sort=popular" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
            See more <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {popularStations.map((station) => (
            <StationCard key={station.id} station={station} variant="default" />
          ))}
        </div>
      </section>

      {/* Categories & Genres */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[var(--foreground)]">Explore Genres & Collections</h2>
          <Link href="/categories" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
            All categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="p-4 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] hover:border-indigo-500/40 text-center transition-all group shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white mx-auto flex items-center justify-center transition-colors mb-2">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-[var(--foreground)] truncate">{cat.nameEn}</h3>
              <p className="text-[11px] text-[var(--foreground-muted)] truncate">{cat.nameHi}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Regional Indian Radios */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[var(--foreground)]">Regional Radios</h2>
          <Link href="/states" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
            Browse by State <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {regionalStations.map((station) => (
            <StationCard key={station.id} station={station} variant="default" />
          ))}
        </div>
      </section>
    </div>
  );
}
