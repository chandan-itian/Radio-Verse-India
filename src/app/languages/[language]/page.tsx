import { getStations } from "@/lib/stations-repository";
import { StationCard } from "@/components/station/station-card";
import Link from "next/link";
import { ArrowLeft, Languages } from "lucide-react";

interface LanguagePageProps {
  params: Promise<{ language: string }>;
}

export default async function LanguageDetailPage({ params }: LanguagePageProps) {
  const { language } = await params;
  const decodedLang = decodeURIComponent(language).toLowerCase();

  const { stations, total } = await getStations({
    language: decodedLang,
    limit: 36,
  });

  return (
    <div className="space-y-6">
      <Link
        href="/languages"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground-muted)] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>All Languages</span>
      </Link>

      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 to-[var(--surface)] border border-[var(--surface-border)]">
        <div className="flex items-center gap-2 text-indigo-400 mb-1">
          <Languages className="w-5 h-5" />
          <span className="text-xs uppercase tracking-wider font-bold">Language Broadcasts</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--foreground)] capitalize">
          {decodedLang} Radio Stations
        </h1>
        <p className="text-xs text-[var(--foreground-muted)] mt-2">
          {total} live radio streams broadcasting in {decodedLang}.
        </p>
      </div>

      {stations.length === 0 ? (
        <div className="py-16 text-center text-[var(--foreground-muted)]">
          <p className="text-sm">No live stations currently found for {decodedLang}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {stations.map((st) => (
            <StationCard key={st.id} station={st} variant="default" />
          ))}
        </div>
      )}
    </div>
  );
}
