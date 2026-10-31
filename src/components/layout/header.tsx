"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Search, Radio, Languages, Download, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const [searchVal, setSearchVal] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/stations?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--surface-border)] bg-[var(--surface)]/90 backdrop-blur-md px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Mobile Logo */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
              <Radio className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-[var(--foreground)]">
              RadioVerse
            </span>
          </Link>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder={t.search.placeholder}
              className="w-full pl-10 pr-12 py-2 rounded-xl text-xs sm:text-sm bg-[var(--background)] border border-[var(--surface-border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>{t.actions.search}</span>
            </button>
          </div>
        </form>

        {/* Right Side Options */}
        <div className="flex items-center gap-2">
          {/* Quick Locale Switcher */}
          <div className="flex items-center rounded-lg border border-[var(--surface-border)] p-0.5 bg-white/5">
            <button
              onClick={() => setLocale("en")}
              className={cn(
                "px-2 py-1 text-xs font-semibold rounded-md transition-colors",
                locale === "en" ? "bg-indigo-600 text-white" : "text-[var(--foreground-muted)] hover:text-white"
              )}
            >
              EN
            </button>
            <button
              onClick={() => setLocale("hi")}
              className={cn(
                "px-2 py-1 text-xs font-semibold rounded-md transition-colors",
                locale === "hi" ? "bg-indigo-600 text-white" : "text-[var(--foreground-muted)] hover:text-white"
              )}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
