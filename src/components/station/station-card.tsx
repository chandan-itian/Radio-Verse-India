"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StationItem } from "@/types/station";
import { useAudioStore } from "@/lib/player/audio-store";
import { useI18n } from "@/lib/i18n";
import { addLocalFavorite, removeLocalFavorite, getLocalFavorites } from "@/lib/storage/preferences";
import { Play, Pause, Heart, Share2, Radio, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StationCardProps {
  station: StationItem;
  variant?: "default" | "compact" | "featured";
  className?: string;
  onFavoriteChange?: () => void;
}

export function StationCard({
  station,
  variant = "default",
  className,
  onFavoriteChange,
}: StationCardProps) {
  const { currentStation, playerState, play, pause, resume } = useAudioStore();
  const { t, interpolate } = useI18n();

  const isCurrent = currentStation?.id === station.id;
  const isPlaying = isCurrent && playerState === "playing";
  const isConnecting = isCurrent && (playerState === "connecting" || playerState === "buffering" || playerState === "reconnecting");
  const isError = isCurrent && playerState === "error";

  const [isFavorite, setIsFavorite] = useState(() => {
    if (typeof window === "undefined") return false;
    const favs = getLocalFavorites();
    return favs.some((s) => s.id === station.id || s.slug === station.slug);
  });

  const [imgError, setImgError] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  const togglePlayback = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCurrent) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
    } else {
      play(station);
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFavorite) {
      removeLocalFavorite(station.id);
      setIsFavorite(false);
    } else {
      addLocalFavorite(station);
      setIsFavorite(true);
    }
    onFavoriteChange?.();
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/stations/${station.slug || station.id}`;
    const shareTitle = `${station.name} - RadioVerse India`;
    const shareText = interpolate(t.stationDetail.shareMessage, { station: station.name });

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch {
        // User cancelled or unsupported, fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2500);
    } catch {
      // ignore
    }
  };

  // Compact Variant (used in lists, history, drawer)
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "group relative flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200",
          "bg-[var(--surface)] hover:bg-[var(--surface-hover)] border-[var(--surface-border)]",
          isCurrent && "ring-1 ring-[var(--primary)] border-[var(--primary)]/50",
          className
        )}
      >
        <Link href={`/stations/${station.slug || station.id}`} className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 flex items-center justify-center border border-white/5">
            {station.logoUrl && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={station.logoUrl}
                alt={station.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            ) : (
              <Radio className="w-5 h-5 text-indigo-400" />
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-indigo-900/60 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-live-pulse" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold truncate text-[var(--foreground)]">{station.name}</h4>
            <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
              <span className="capitalize">{station.language}</span>
              {station.state && <span>• {station.state}</span>}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 ml-2">
          <button
            onClick={toggleFavorite}
            aria-label={isFavorite ? t.actions.unfavorite : t.actions.favorite}
            className={cn(
              "p-2 rounded-lg transition-colors hover:bg-white/10",
              isFavorite ? "text-red-500" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            )}
          >
            <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
          </button>

          <button
            onClick={togglePlayback}
            aria-label={isPlaying ? t.actions.pause : t.actions.play}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-all",
              isCurrent ? "bg-[var(--primary)] text-white shadow-md shadow-indigo-500/25" : "bg-white/10 hover:bg-[var(--primary)] hover:text-white text-[var(--foreground)]"
            )}
          >
            {isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
        </div>
      </div>
    );
  }

  // Featured Variant (large banner card on Home)
  if (variant === "featured") {
    return (
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300",
          "bg-gradient-to-br from-indigo-950/40 via-[var(--surface)] to-[var(--surface)] border-[var(--surface-border)] hover:border-indigo-500/40",
          isCurrent && "ring-2 ring-[var(--primary)]/60",
          className
        )}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 flex-shrink-0 flex items-center justify-center shadow-lg">
              {station.logoUrl && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={station.logoUrl}
                  alt={station.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                  loading="lazy"
                />
              ) : (
                <Radio className="w-8 h-8 text-indigo-400" />
              )}
              <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-red-600/90 text-[10px] font-bold text-white flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-live-pulse" />
                {t.live}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  Featured Broadcaster
                </span>
                <span className="text-xs text-[var(--foreground-muted)] capitalize">
                  {station.language} {station.state ? `• ${station.state}` : ""}
                </span>
              </div>
              <Link href={`/stations/${station.slug || station.id}`}>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)] truncate group-hover:text-indigo-400 transition-colors">
                  {station.name}
                </h3>
              </Link>
              {station.description && (
                <p className="text-xs sm:text-sm text-[var(--foreground-muted)] line-clamp-2 mt-1">
                  {station.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFavorite}
                aria-label={isFavorite ? t.actions.unfavorite : t.actions.favorite}
                className={cn(
                  "p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors",
                  isFavorite ? "text-red-500" : "text-[var(--foreground-muted)] hover:text-white"
                )}
              >
                <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
              </button>

              <button
                onClick={handleShare}
                aria-label={t.actions.share}
                className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-[var(--foreground-muted)] hover:text-white transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={togglePlayback}
              aria-label={isPlaying ? t.actions.pause : t.actions.play}
              className="px-6 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">{t.player.connecting}</span>
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span className="text-sm">{t.actions.pause}</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                  <span className="text-sm">{t.actions.play}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {copyToast && (
          <div className="absolute bottom-2 right-4 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg shadow-md animate-fade-in">
            {t.actions.linkCopied}
          </div>
        )}
      </div>
    );
  }

  // Default Grid Card Variant
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200",
        "bg-[var(--surface)] hover:bg-[var(--surface-hover)] border-[var(--surface-border)] hover:border-indigo-500/30 hover:shadow-lg hover:shadow-black/20",
        isCurrent && "ring-2 ring-[var(--primary)]/70 border-transparent",
        className
      )}
    >
      <div>
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-900 border border-white/5 mb-3 flex items-center justify-center">
          {station.logoUrl && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={station.logoUrl}
              alt={station.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-indigo-400/80">
              <Radio className="w-10 h-10 mb-1" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{station.language}</span>
            </div>
          )}

          {/* Top badges */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-red-600/90 text-[10px] font-bold text-white flex items-center gap-1 backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-live-pulse" />
              {t.live}
            </span>
          </div>

          {/* Quick Play overlay button */}
          <button
            onClick={togglePlayback}
            aria-label={isPlaying ? t.actions.pause : t.actions.play}
            className={cn(
              "absolute inset-0 m-auto w-14 h-14 rounded-full flex items-center justify-center transition-all",
              "bg-indigo-600/90 hover:bg-indigo-500 text-white shadow-xl shadow-black/50 backdrop-blur-xs",
              isPlaying || isConnecting
                ? "opacity-100 scale-100"
                : "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
            )}
          >
            {isConnecting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </button>
        </div>

        {/* Text Info */}
        <div className="mb-2">
          <Link href={`/stations/${station.slug || station.id}`}>
            <h3 className="font-semibold text-sm sm:text-base text-[var(--foreground)] truncate group-hover:text-indigo-400 transition-colors">
              {station.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--foreground-muted)]">
            <span className="capitalize font-medium">{station.language}</span>
            {station.state && (
              <>
                <span>•</span>
                <span className="truncate">{station.state}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--surface-border)] mt-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={toggleFavorite}
            aria-label={isFavorite ? t.actions.unfavorite : t.actions.favorite}
            className={cn(
              "p-1.5 rounded-lg transition-colors hover:bg-white/10",
              isFavorite ? "text-red-500" : "text-[var(--foreground-muted)] hover:text-white"
            )}
          >
            <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
          </button>

          <button
            onClick={handleShare}
            aria-label={t.actions.share}
            className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-white hover:bg-white/10 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {isError && (
          <span className="text-[11px] text-red-400 flex items-center gap-1" title={t.player.error}>
            <AlertCircle className="w-3.5 h-3.5" />
            {t.player.error}
          </span>
        )}

        <button
          onClick={togglePlayback}
          aria-label={isPlaying ? t.actions.pause : t.actions.play}
          className="sm:hidden p-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-medium"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>

      {copyToast && (
        <div className="absolute inset-x-2 bottom-2 text-center text-xs bg-indigo-600 text-white py-1 rounded-md shadow-md">
          {t.actions.linkCopied}
        </div>
      )}
    </div>
  );
}
