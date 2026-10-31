import Link from "next/link";
import { Languages, Radio } from "lucide-react";

export const INDIAN_LANGUAGES_CATALOG = [
  { id: "hindi", nameEn: "Hindi", nameNative: "हिन्दी", count: "120+ stations" },
  { id: "punjabi", nameEn: "Punjabi", nameNative: "ਪੰਜਾਬੀ", count: "40+ stations" },
  { id: "bhojpuri", nameEn: "Bhojpuri", nameNative: "भोजपुरी", count: "25+ stations" },
  { id: "tamil", nameEn: "Tamil", nameNative: "தமிழ்", count: "60+ stations" },
  { id: "telugu", nameEn: "Telugu", nameNative: "తెలుగు", count: "45+ stations" },
  { id: "bengali", nameEn: "Bengali", nameNative: "বাংলা", count: "35+ stations" },
  { id: "kannada", nameEn: "Kannada", nameNative: "ಕನ್ನಡ", count: "30+ stations" },
  { id: "marathi", nameEn: "Marathi", nameNative: "मराठी", count: "30+ stations" },
  { id: "malayalam", nameEn: "Malayalam", nameNative: "മലയാളം", count: "35+ stations" },
  { id: "gujarati", nameEn: "Gujarati", nameNative: "ગુજરાતી", count: "20+ stations" },
  { id: "odia", nameEn: "Odia", nameNative: "ଓଡ଼ିଆ", count: "15+ stations" },
  { id: "urdu", nameEn: "Urdu", nameNative: "اردو", count: "20+ stations" },
  { id: "english", nameEn: "English", nameNative: "English", count: "80+ stations" },
];

export default function LanguagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">Languages of India</h1>
        <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mt-1">
          Tune in to regional broadcasts and local voices in the language of your heart.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {INDIAN_LANGUAGES_CATALOG.map((lang) => (
          <Link
            key={lang.id}
            href={`/languages/${lang.id}`}
            className="p-5 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] hover:border-indigo-500/40 transition-all group shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl sm:text-2xl font-black text-indigo-400 group-hover:scale-105 transition-transform">
                {lang.nameNative}
              </span>
              <Radio className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-sm font-bold text-[var(--foreground)]">{lang.nameEn}</h2>
            <p className="text-xs text-[var(--foreground-muted)] mt-0.5">{lang.count}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
