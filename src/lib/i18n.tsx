"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { en, TranslationKey } from "@/locales/en";
import { hi } from "@/locales/hi";

export type SupportedLocale = "en" | "hi";

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: TranslationKey;
  interpolate: (str: string, params: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = "radioverse_locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
      if (saved === "hi" || saved === "en") {
        setLocaleState(saved);
        document.documentElement.lang = saved;
      } else {
        // Detect browser language if Hindi
        const browserLang = navigator.language?.toLowerCase();
        if (browserLang.startsWith("hi")) {
          setLocaleState("hi");
          document.documentElement.lang = "hi";
        }
      }
    } catch {
      // Storage unavailable or SSR
    }
    setMounted(true);
  }, []);

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      // ignore
    }
  };

  const currentTranslations = locale === "hi" ? hi : en;

  const interpolate = (template: string, params: Record<string, string | number>): string => {
    return Object.entries(params).reduce((acc, [key, val]) => {
      return acc.replace(new RegExp(`\\{${key}\\}`, "g"), String(val));
    }, template);
  };

  return (
    <I18nContext.Provider value={{ locale: mounted ? locale : "en", setLocale, t: currentTranslations, interpolate }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    // Return default english fallback if used outside provider
    return {
      locale: "en" as SupportedLocale,
      setLocale: () => {},
      t: en,
      interpolate: (str: string, params: Record<string, string | number>) => {
        return Object.entries(params).reduce((acc, [key, val]) => {
          return acc.replace(new RegExp(`\\{${key}\\}`, "g"), String(val));
        }, str);
      },
    };
  }
  return context;
}
