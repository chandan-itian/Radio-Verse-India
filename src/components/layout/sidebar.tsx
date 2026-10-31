"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import {
  Radio,
  Compass,
  ListMusic,
  Heart,
  History,
  Grid,
  Languages,
  MapPin,
  Settings,
  ShieldAlert,
  Download,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useI18n();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const navItems = [
    { href: "/", label: t.nav.home, icon: Radio },
    { href: "/discover", label: t.nav.discover, icon: Compass },
    { href: "/stations", label: t.nav.stations, icon: ListMusic },
    { href: "/categories", label: t.nav.categories, icon: Grid },
    { href: "/languages", label: t.nav.languages, icon: Languages },
    { href: "/states", label: t.nav.states, icon: MapPin },
    { href: "/favorites", label: t.nav.favorites, icon: Heart },
    { href: "/recently-played", label: t.nav.history, icon: History },
    { href: "/settings", label: t.nav.settings, icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col justify-between border-r border-[var(--surface-border)] bg-[var(--surface)] transition-all duration-300 select-none z-30 sticky top-0 h-screen pb-24",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-[var(--surface-border)]">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
              <Radio className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-extrabold text-base tracking-tight text-[var(--foreground)] truncate block">
                  RadioVerse
                </span>
                <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold block">
                  India • live
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-white/5"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--primary)] text-white shadow-sm shadow-indigo-600/30"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-white/5",
                  isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="p-3 border-t border-[var(--surface-border)] space-y-2">
        {/* Language switch */}
        <div className="flex items-center gap-1 justify-center">
          <button
            onClick={() => setLocale("en")}
            className={cn(
              "px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors",
              locale === "en" ? "bg-indigo-600 text-white" : "text-[var(--foreground-muted)] hover:text-white"
            )}
          >
            EN
          </button>
          <button
            onClick={() => setLocale("hi")}
            className={cn(
              "px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors",
              locale === "hi" ? "bg-indigo-600 text-white" : "text-[var(--foreground-muted)] hover:text-white"
            )}
          >
            हिन्दी
          </button>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-white ml-auto"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Admin link */}
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors",
            isCollapsed && "justify-center px-0"
          )}
          title={isCollapsed ? t.nav.admin : undefined}
        >
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          {!isCollapsed && <span>{t.nav.admin}</span>}
        </Link>
      </div>
    </aside>
  );
}
