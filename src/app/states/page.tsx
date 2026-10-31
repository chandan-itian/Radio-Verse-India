import Link from "next/link";
import { MapPin } from "lucide-react";

export const INDIAN_STATES_LIST = [
  { slug: "delhi", name: "Delhi NCR", capital: "New Delhi", region: "North India" },
  { slug: "maharashtra", name: "Maharashtra", capital: "Mumbai", region: "West India" },
  { slug: "karnataka", name: "Karnataka", capital: "Bengaluru", region: "South India" },
  { slug: "tamil-nadu", name: "Tamil Nadu", capital: "Chennai", region: "South India" },
  { slug: "west-bengal", name: "West Bengal", capital: "Kolkata", region: "East India" },
  { slug: "punjab", name: "Punjab", capital: "Chandigarh", region: "North India" },
  { slug: "bihar", name: "Bihar", capital: "Patna", region: "East India" },
  { slug: "uttar-pradesh", name: "Uttar Pradesh", capital: "Lucknow", region: "North India" },
  { slug: "kerala", name: "Kerala", capital: "Thiruvananthapuram", region: "South India" },
  { slug: "gujarat", name: "Gujarat", capital: "Gandhinagar", region: "West India" },
  { slug: "rajasthan", name: "Rajasthan", capital: "Jaipur", region: "North India" },
  { slug: "telangana", name: "Telangana", capital: "Hyderabad", region: "South India" },
];

export default function StatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">Stations by Indian State</h1>
        <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mt-1">
          Explore local AIR stations, community radios, and commercial FM by state.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {INDIAN_STATES_LIST.map((st) => (
          <Link
            key={st.slug}
            href={`/states/${st.slug}`}
            className="p-5 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] hover:border-indigo-500/40 transition-all group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-[var(--foreground)] group-hover:text-indigo-400 transition-colors">
              {st.name}
            </h2>
            <p className="text-xs text-[var(--foreground-muted)] mt-0.5">{st.region} • {st.capital}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
