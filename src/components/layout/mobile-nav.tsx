"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Radio, Compass, ListMusic, Heart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const links = [
    { href: "/", label: t.nav.home, icon: Radio },
    { href: "/discover", label: t.nav.discover, icon: Compass },
    { href: "/stations", label: t.nav.stations, icon: ListMusic },
    { href: "/favorites", label: t.nav.favorites, icon: Heart },
    { href: "/settings", label: t.nav.settings, icon: Settings },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-14 left-0 right-0 z-30 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--surface-border)] px-2 py-1.5"
    >
      <div className="flex items-center justify-around">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium transition-colors",
                isActive
                  ? "text-[var(--primary)] font-bold"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
