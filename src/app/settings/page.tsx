"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { clearAllLocalData } from "@/lib/storage/preferences";
import {
  Settings,
  Languages,
  Moon,
  Sun,
  Radio,
  Trash2,
  Shield,
  Info,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const [clearedNotice, setClearedNotice] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const handleClearData = () => {
    if (confirm("Are you sure you want to delete all saved favorites, volume settings, and listening history from this device?")) {
      clearAllLocalData();
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 3000);
    }
  };

  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">{t.settings.title}</h1>
        <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mt-1">
          Customize your listening experience, language preferences, and privacy controls.
        </p>
      </div>

      {/* Language Section */}
      <section className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--surface-border)] shadow-xs">
        <div className="flex items-center gap-2.5 text-indigo-400 mb-2">
          <Languages className="w-5 h-5" />
          <h2 className="text-base font-bold text-[var(--foreground)]">{t.settings.languageSection}</h2>
        </div>
        <p className="text-xs text-[var(--foreground-muted)] mb-5">{t.settings.languageDesc}</p>

        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            onClick={() => setLocale("en")}
            className={cn(
              "p-4 rounded-2xl border text-left font-semibold transition-all flex items-center justify-between",
              locale === "en"
                ? "bg-indigo-600/15 border-indigo-500 text-indigo-400 ring-2 ring-indigo-500/30"
                : "border-[var(--surface-border)] bg-white/5 hover:bg-white/10 text-[var(--foreground)]"
            )}
          >
            <div>
              <span className="text-sm block">English</span>
              <span className="text-[11px] text-[var(--foreground-muted)]">Global UI</span>
            </div>
            {locale === "en" && <Check className="w-4 h-4 text-indigo-400" />}
          </button>

          <button
            onClick={() => setLocale("hi")}
            className={cn(
              "p-4 rounded-2xl border text-left font-semibold transition-all flex items-center justify-between",
              locale === "hi"
                ? "bg-indigo-600/15 border-indigo-500 text-indigo-400 ring-2 ring-indigo-500/30"
                : "border-[var(--surface-border)] bg-white/5 hover:bg-white/10 text-[var(--foreground)]"
            )}
          >
            <div>
              <span className="text-sm block font-medium">हिन्दी (Hindi)</span>
              <span className="text-[11px] text-[var(--foreground-muted)]">भारतीय इंटरफ़ेस</span>
            </div>
            {locale === "hi" && <Check className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </section>

      {/* Theme Section */}
      <section className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--surface-border)] shadow-xs">
        <div className="flex items-center gap-2.5 text-indigo-400 mb-2">
          <Moon className="w-5 h-5" />
          <h2 className="text-base font-bold text-[var(--foreground)]">{t.settings.themeSection}</h2>
        </div>
        <p className="text-xs text-[var(--foreground-muted)] mb-5">{t.settings.themeDesc}</p>

        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            onClick={() => handleThemeChange("dark")}
            className={cn(
              "p-4 rounded-2xl border text-left font-semibold transition-all flex items-center justify-between",
              theme === "dark"
                ? "bg-indigo-600/15 border-indigo-500 text-indigo-400 ring-2 ring-indigo-500/30"
                : "border-[var(--surface-border)] bg-white/5 hover:bg-white/10 text-[var(--foreground)]"
            )}
          >
            <div className="flex items-center gap-2.5">
              <Moon className="w-4 h-4" />
              <span className="text-sm">{t.settings.themeDark}</span>
            </div>
            {theme === "dark" && <Check className="w-4 h-4 text-indigo-400" />}
          </button>

          <button
            onClick={() => handleThemeChange("light")}
            className={cn(
              "p-4 rounded-2xl border text-left font-semibold transition-all flex items-center justify-between",
              theme === "light"
                ? "bg-indigo-600/15 border-indigo-500 text-indigo-400 ring-2 ring-indigo-500/30"
                : "border-[var(--surface-border)] bg-white/5 hover:bg-white/10 text-[var(--foreground)]"
            )}
          >
            <div className="flex items-center gap-2.5">
              <Sun className="w-4 h-4" />
              <span className="text-sm">{t.settings.themeLight}</span>
            </div>
            {theme === "light" && <Check className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </section>

      {/* Storage and Privacy */}
      <section className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--surface-border)] shadow-xs">
        <div className="flex items-center gap-2.5 text-red-400 mb-2">
          <Shield className="w-5 h-5" />
          <h2 className="text-base font-bold text-[var(--foreground)]">{t.settings.storageSection}</h2>
        </div>
        <p className="text-xs text-[var(--foreground-muted)] mb-4">{t.settings.storageDesc}</p>

        <button
          onClick={handleClearData}
          className="px-4 py-2.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>{t.settings.clearData}</span>
        </button>

        {clearedNotice && (
          <p className="text-xs text-emerald-400 mt-3 font-semibold">{t.settings.dataCleared}</p>
        )}
      </section>

      {/* About & Disclaimer */}
      <section className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--surface-border)] text-xs text-[var(--foreground-muted)] space-y-3">
        <div className="flex items-center gap-2 text-[var(--foreground)] font-bold text-sm">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>{t.settings.aboutSection}</span>
        </div>
        <p className="leading-relaxed">{t.settings.disclaimer}</p>
        <p className="text-[11px] text-slate-500 font-mono">
          {t.settings.version} 2.0.0 (Production Build) • RadioVerse India
        </p>
      </section>
    </div>
  );
}
