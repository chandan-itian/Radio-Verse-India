import { getStations } from "@/lib/stations-repository";
import { StationCard } from "@/components/station/station-card";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { INDIAN_STATES_LIST } from "../page";

interface StatePageProps {
  params: Promise<{ state: string }>;
}

export function generateStaticParams() {
  return INDIAN_STATES_LIST.map((s) => ({ state: s.slug }));
}

export default async function StateDetailPage({ params }: StatePageProps) {
  const { state } = await params;
  const decodedState = decodeURIComponent(state).toLowerCase();

  const matched = INDIAN_STATES_LIST.find(
    (s) => s.slug === decodedState || s.name.toLowerCase() === decodedState
  );
  const stateQuery = matched ? matched.name : decodedState;

  const { stations, total } = await getStations({
    state: stateQuery,
    limit: 30,
  });

  return (
    <div className="space-y-6">
      <Link
        href="/states"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground-muted)] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>All States</span>
      </Link>

      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 to-[var(--surface)] border border-[var(--surface-border)]">
        <div className="flex items-center gap-2 text-indigo-400 mb-1">
          <MapPin className="w-5 h-5" />
          <span className="text-xs uppercase tracking-wider font-bold">State Radios</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--foreground)]">
          {matched ? matched.name : stateQuery}
        </h1>
        <p className="text-xs text-[var(--foreground-muted)] mt-2">
          {total} stations broadcasting from {matched ? matched.name : stateQuery}.
        </p>
      </div>

      {stations.length === 0 ? (
        <div className="py-16 text-center text-[var(--foreground-muted)]">
          <p className="text-sm">No stations currently active for this region.</p>
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
