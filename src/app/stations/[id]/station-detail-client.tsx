"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StationItem } from "@/types/station";
import { useAudioStore } from "@/lib/player/audio-store";
import { useI18n } from "@/lib/i18n";
import { StationCard } from "@/components/station/station-card";
import {
  Play,
  Pause,
  Heart,
  Share2,
  ExternalLink,
  ShieldCheck,
  Radio,
  Clock,
  Music,
  Check,
  MessageCircle,
  Send,
  Loader2,
  Volume2,
} from "lucide-react";
import { addLocalFavorite, removeLocalFavorite, getLocalFavorites } from "@/lib/storage/preferences";
import { cn } from "@/lib/utils";

interface StationDetailClientProps {
  station: StationItem;
  relatedStations: StationItem[];
}

export function StationDetailClient({ station, relatedStations }: StationDetailClientProps) {
  const { currentStation, playerState, play, pause, resume } = useAudioStore();
  const { t, interpolate } = useI18n();

  const isCurrent = currentStation?.id === station.id;
  const isPlaying = isCurrent && playerState === "playing";
  const isConnecting = isCurrent && (playerState === "connecting" || playerState === "buffering");

  const [isFavorite, setIsFavorite] = useState(() => {
    if (typeof window === "undefined") return false;
    const favs = getLocalFavorites();
    return favs.some((s) => s.id === station.id || s.slug === station.slug);
  });

  const [copied, setCopied] = useState(false);

  const toggleFavorite = () => {
    if (isFavorite) {
      removeLocalFavorite(station.id);
      setIsFavorite(false);
    } else {
      addLocalFavorite(station);
      setIsFavorite(true);
    }
  };

  const handlePlayToggle = () => {
    if (isCurrent) {
      if (isPlaying) pause();
      else resume();
    } else {
      play(station);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : `https://radioverse.in/stations/${station.slug || station.id}`;
  const shareText = interpolate(t.stationDetail.shareMessage, { station: station.name });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${station.name} - RadioVerse India`,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // ignore
      }
    } else {
      handleCopyLink();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

  const endpoint = station.endpoints[0];

  return (
    <div className="space-y-10">
      {/* Top Banner Card */}
      <section className="relative overflow-hidden rounded-3xl bg-[var(--surface)] border border-[var(--surface-border)] p-6 sm:p-10 shadow-xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Station Large Avatar */}
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl flex items-center justify-center flex-shrink-0">
            {station.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={station.logoUrl}
                alt={station.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Radio className="w-16 h-16 text-indigo-400" />
            )}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center gap-1 shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-live-pulse" />
              {t.live}
            </div>
          </div>

          {/* Station Details */}
          <div className="flex-1 text-center md:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t.stationDetail.verifiedBadge}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-[var(--foreground-muted)] capitalize">
                {station.language}
              </span>
              {station.state && (
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-[var(--foreground-muted)]">
                  {station.state}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
              {station.name}
            </h1>

            {station.description && (
              <p className="mt-3 text-sm text-[var(--foreground-muted)] leading-relaxed max-w-2xl">
                {station.description}
              </p>
            )}

            {/* Play and Favorite Action Bar */}
            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={handlePlayToggle}
                className="px-8 py-3.5 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 active:scale-95 transition-all"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t.player.connecting}</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>{t.actions.pause}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                    <span>{t.actions.play}</span>
                  </>
                )}
              </button>

              <button
                onClick={toggleFavorite}
                className={cn(
                  "p-3.5 rounded-2xl border transition-colors flex items-center gap-2 text-sm font-semibold",
                  isFavorite
                    ? "bg-red-500/15 border-red-500/40 text-red-500"
                    : "border-[var(--surface-border)] bg-white/5 hover:bg-white/10 text-[var(--foreground)]"
                )}
              >
                <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
                <span>{isFavorite ? t.actions.unfavorite : t.actions.favorite}</span>
              </button>

              {station.homepageUrl && (
                <a
                  href={station.homepageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3.5 rounded-2xl border border-[var(--surface-border)] bg-white/5 hover:bg-white/10 text-xs font-semibold text-[var(--foreground-muted)] hover:text-white flex items-center gap-2 transition-colors"
                >
                  <span>{t.stationDetail.officialLink}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Social Share Buttons */}
            <div className="mt-6 pt-5 border-t border-[var(--surface-border)] flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="text-xs font-semibold text-[var(--foreground-muted)] mr-2 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" />
                {t.actions.share}:
              </span>

              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl border border-[var(--surface-border)] bg-white/5 hover:bg-white/10 text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? t.actions.linkCopied : t.actions.copyLink}</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-sky-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Stream Specifications */}
      <section className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] shadow-sm">
        <h3 className="font-bold text-sm text-[var(--foreground)] mb-4 flex items-center gap-2">
          <Music className="w-4 h-4 text-indigo-400" />
          <span>{t.stationDetail.technicalInfo}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[11px] text-[var(--foreground-muted)] block mb-1">{t.stationDetail.streamType}</span>
            <span className="text-sm font-bold text-[var(--foreground)] uppercase">
              {endpoint?.streamType || "Live Web Stream"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[11px] text-[var(--foreground-muted)] block mb-1">{t.stationDetail.codec}</span>
            <span className="text-sm font-bold text-[var(--foreground)]">
              {endpoint?.codec || "MP3 / AAC"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[11px] text-[var(--foreground-muted)] block mb-1">{t.stationDetail.bitrate}</span>
            <span className="text-sm font-bold text-[var(--foreground)]">
              {endpoint?.bitrate ? `${endpoint.bitrate} kbps` : "128 kbps"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[11px] text-[var(--foreground-muted)] block mb-1">{t.stationDetail.status}</span>
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Verified Playable
            </span>
          </div>
        </div>
      </section>

      {/* Related Stations */}
      {relatedStations.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[var(--foreground)]">{t.stationDetail.relatedStations}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {relatedStations.map((st) => (
              <StationCard key={st.id} station={st} variant="default" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
