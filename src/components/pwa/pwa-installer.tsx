"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Download, X, Smartphone, Globe, Share } from "lucide-react";

export function PwaInstaller() {
  const { t } = useI18n();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("Service Worker registered successfully."))
        .catch((err) => console.warn("SW registration failed:", err));
    }

    // Check beforeinstallprompt for Chrome / Edge / Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  if (isDismissed || (!isInstallable && !isIOS)) {
    return null;
  }

  return (
    <>
      <div className="mx-4 my-3 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/30 shadow-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <Download className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate">{t.pwa.installPrompt}</h4>
            <p className="text-[11px] text-indigo-200 line-clamp-1">{t.pwa.installDesc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold shadow-xs"
          >
            {t.actions.install}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            aria-label={t.actions.close}
            className="p-1 rounded-lg text-indigo-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari instructions modal */}
      {showIOSModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-sm rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1 text-[var(--foreground-muted)] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-indigo-600 mx-auto flex items-center justify-center text-white mb-3">
              <Share className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-[var(--foreground)] mb-2">Install on iPhone / iPad</h3>
            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed mb-4">
              {t.pwa.iosInstructions}
            </p>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
