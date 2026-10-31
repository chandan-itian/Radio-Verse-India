import { getAllCategories } from "@/lib/stations-repository";
import Link from "next/link";
import { Compass, Music, Radio, Film, Sparkles, Newspaper, Disc, Flame, Headphones, Globe } from "lucide-react";

export default function CategoriesPage() {
  const categories = getAllCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">Genres & Collections</h1>
        <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mt-1">
          Explore India's radio spectrum through genres, moods, and musical eras.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            className="p-6 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] hover:border-indigo-500/40 transition-all group flex flex-col justify-between shadow-xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)] group-hover:text-indigo-400 transition-colors">
                {cat.nameEn}
              </h2>
              <p className="text-xs text-[var(--foreground-muted)] font-medium mt-0.5">{cat.nameHi}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
