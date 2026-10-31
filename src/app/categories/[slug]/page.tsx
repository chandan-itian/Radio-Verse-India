import { notFound } from "next/navigation";
import { getStations, getAllCategories } from "@/lib/stations-repository";
import { StationCard } from "@/components/station/station-card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categories = getAllCategories();
  const cat = categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase());

  if (!cat) {
    notFound();
  }

  const { stations, total } = await getStations({
    category: cat.slug,
    limit: 30,
  });

  return (
    <div className="space-y-6">
      <Link
        href="/categories"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground-muted)] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>All Categories</span>
      </Link>

      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 to-[var(--surface)] border border-[var(--surface-border)]">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--foreground)]">{cat.nameEn}</h1>
        <p className="text-sm font-semibold text-indigo-400 mt-1">{cat.nameHi}</p>
        <p className="text-xs text-[var(--foreground-muted)] mt-2">
          {total} live stations currently playing in this genre.
        </p>
      </div>

      {stations.length === 0 ? (
        <div className="py-16 text-center text-[var(--foreground-muted)]">
          <p className="text-sm">No stations currently active for this category.</p>
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
