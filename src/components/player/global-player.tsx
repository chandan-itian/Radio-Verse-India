"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAudioStore } from "@/lib/player/audio-store";
import { useSleepTimer } from "@/lib/player/sleep-timer";
import { useI18n } from "@/lib/i18n";
import { formatDuration } from "@/lib/utils";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Radio,
  Timer,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Heart,
  Share2,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { addLocalFavorite, removeLocalFavorite, getLocalFavorites } from "@/lib/storage/preferences";
import { cn } from "@/lib/utils";

export function GlobalPlayer() {
  const {
    currentStation,
    playerState,
    errorMessage,
    volume,
    isMuted,
    isExpanded,
    play,
    pause,
    resume,
    next,
    prev,
    retry,
    setVolume,
    toggleMute,
    setExpanded,
    init,
  } = useAudioStore();

  const { t, interpolate } = useI18n();
  const sleepTimer = useSleepTimer();

  const [showTimerModal, setShowTimerModal] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (currentStation) {
      const favs = getLocalFavorites();
      setIsFavorite(favs.some((s) => s.id === currentStation.id || s.slug === currentStation.slug));
    }
  }, [currentStation]);

  if (!currentStation) return null;

  const isPlaying = playerState === "playing";
  const isConnecting = playerState === "connecting" || playerState === "buffering" || playerState === "reconnecting";
  const isError = playerState === "error";

  const toggleFavorite = () => {
    if (!currentStation) return;
    if (isFavorite) {
      removeLocalFavorite(currentStation.id);
      setIsFavorite(false);
    } else {
      addLocalFavorite(currentStation);
      setIsFavorite(true);
    }
  };

  const handleShare = async () => {
    if (!currentStation) return;
    const shareUrl = `${window.location.origin}/stations/${currentStation.slug || currentStation.id}`;
    const shareTitle = `${currentStation.name} - RadioVerse India`;
    const shareText = interpolate(t.stationDetail.shareMessage, { station: currentStation.name });

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch {
        // fallback
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert(t.actions.linkCopied);
    } catch {
      // ignore
    }
  };

  return (
    <>
      {/* ================= DESKTOP & MOBILE BOTTOM BAR ================= */}
      <aside
        aria-label="Audio Player"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--surface-border)] bg-[var(--surface)]/95 backdrop-blur-md transition-all shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Station Info (Left) */}
          <div className="flex items-center gap-3 min-w-0 flex-1 sm:max-w-xs cursor-pointer sm:cursor-default" onClick={() => setExpanded(true)}>
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 flex items-center justify-center border border-white/5">
              {currentStation.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentStation.logoUrl}
                  alt={currentStation.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Radio className="w-6 h-6 text-indigo-400" />
              )}
              {isPlaying && (
                <div className="absolute top-1 left-1 px-1 py-0.2 rounded bg-red-600 text-[8px] font-bold text-white uppercase flex items-center gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-white animate-live-pulse" />
                  {t.live}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/stations/${currentStation.slug || currentStation.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold text-sm text-[var(--foreground)] truncate hover:text-indigo-400 transition-colors"
                >
                  {currentStation.name}
                </Link>
              </div>

              <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                {isConnecting ? (
                  <span className="text-amber-400 flex items-center gap-1 truncate">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t.player.connecting}
                  </span>
                ) : isError ? (
                  <span className="text-red-400 flex items-center gap-1 truncate" title={errorMessage}>
                    <AlertCircle className="w-3 h-3" />
                    {t.player.error}
                  </span>
                ) : (
                  <span className="capitalize truncate">
                    {currentStation.language} {currentStation.state ? `• ${currentStation.state}` : ""}
                  </span>
                )}
              </div>
            </div>

            {/* Mobile Expand Chevron */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(true);
              }}
              aria-label={t.player.expand}
              className="sm:hidden p-1 text-[var(--foreground-muted)] hover:text-white"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>

          {/* Central Controls (Center) */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={prev}
                aria-label={t.player.prev}
                className="hidden sm:inline-flex p-2 text-[var(--foreground-muted)] hover:text-white transition-colors"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              {isError ? (
                <button
                  onClick={retry}
                  aria-label={t.actions.retry}
                  className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={isPlaying ? pause : resume}
                  aria-label={isPlaying ? t.actions.pause : t.actions.play}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
                >
                  {isConnecting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>
              )}

              <button
                onClick={next}
                aria-label={t.player.next}
                className="hidden sm:inline-flex p-2 text-[var(--foreground-muted)] hover:text-white transition-colors"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>

            {/* Live Indicator text under controls on desktop */}
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-live-pulse" />
              {t.player.liveStream}
            </div>
          </div>

          {/* Actions & Volume (Right) */}
          <div className="hidden sm:flex items-center justify-end gap-3 flex-1 max-w-xs">
            {/* Sleep Timer button */}
            <button
              onClick={() => setShowTimerModal(true)}
              aria-label={t.sleepTimer.title}
              className={cn(
                "p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium",
                sleepTimer.isActive
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-[var(--foreground-muted)] hover:text-white hover:bg-white/5"
              )}
            >
              <Timer className="w-4 h-4" />
              {sleepTimer.isActive && <span>{formatDuration(sleepTimer.remainingSeconds)}</span>}
            </button>

            {/* Favorite */}
            <button
              onClick={toggleFavorite}
              aria-label={isFavorite ? t.actions.unfavorite : t.actions.favorite}
              className={cn(
                "p-2 rounded-lg transition-colors hover:bg-white/5",
                isFavorite ? "text-red-500" : "text-[var(--foreground-muted)] hover:text-white"
              )}
            >
              <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              aria-label={t.actions.share}
              className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-white hover:bg-white/5 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 pl-2 border-l border-[var(--surface-border)]">
              <button
                onClick={toggleMute}
                aria-label={isMuted ? t.player.unmute : t.player.mute}
                className="p-1.5 text-[var(--foreground-muted)] hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                aria-label={t.player.volume}
                className="w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* ================= FULL SCREEN MOBILE DRAWER ================= */}
      {isExpanded && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[var(--background)] flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-bottom duration-300"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setExpanded(false)}
              aria-label={t.player.collapse}
              className="p-2 rounded-full bg-white/5 text-[var(--foreground-muted)] hover:text-white"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
            <div className="text-center">
              <span className="text-xs uppercase tracking-widest text-[var(--foreground-muted)] font-bold">
                {t.player.liveStream}
              </span>
            </div>
            <button
              onClick={() => setShowTimerModal(true)}
              aria-label={t.sleepTimer.title}
              className={cn(
                "p-2 rounded-full bg-white/5 text-[var(--foreground-muted)] hover:text-white",
                sleepTimer.isActive && "text-indigo-400 bg-indigo-600/20"
              )}
            >
              <Timer className="w-5 h-5" />
            </button>
          </div>

          {/* Large Album Art */}
          <div className="flex flex-col items-center justify-center my-6">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl flex items-center justify-center">
              {currentStation.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentStation.logoUrl}
                  alt={currentStation.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Radio className="w-24 h-24 text-indigo-400" />
              )}
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-red-600 font-bold text-xs text-white flex items-center gap-1.5 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white animate-live-pulse" />
                {t.live}
              </div>
            </div>

            {/* Station Title & Meta */}
            <div className="text-center mt-6 max-w-sm px-4">
              <h2 className="text-2xl font-bold text-[var(--foreground)] truncate">{currentStation.name}</h2>
              <p className="text-sm text-[var(--foreground-muted)] capitalize mt-1">
                {currentStation.language} {currentStation.state ? `• ${currentStation.state}` : ""}
              </p>
              {sleepTimer.isActive && (
                <p className="text-xs text-indigo-400 font-medium mt-2 bg-indigo-950/60 py-1 px-3 rounded-full inline-block border border-indigo-800">
                  {interpolate(t.sleepTimer.activeCountdown, {
                    time: formatDuration(sleepTimer.remainingSeconds),
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Controls & Volume */}
          <div className="w-full max-w-md mx-auto space-y-6">
            {/* Quick action bar */}
            <div className="flex items-center justify-around px-8">
              <button
                onClick={toggleFavorite}
                aria-label={isFavorite ? t.actions.unfavorite : t.actions.favorite}
                className={cn("p-3 rounded-full bg-white/5", isFavorite ? "text-red-500" : "text-white/60")}
              >
                <Heart className={cn("w-6 h-6", isFavorite && "fill-current")} />
              </button>

              <button
                onClick={handleShare}
                aria-label={t.actions.share}
                className="p-3 rounded-full bg-white/5 text-white/60 hover:text-white"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            {/* Play / Next / Prev */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={prev}
                aria-label={t.player.prev}
                className="p-3 text-[var(--foreground-muted)] hover:text-white"
              >
                <SkipBack className="w-8 h-8 fill-current" />
              </button>

              <button
                onClick={isPlaying ? pause : resume}
                aria-label={isPlaying ? t.actions.pause : t.actions.play}
                className="w-20 h-20 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 active:scale-95 transition-transform"
              >
                {isConnecting ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current ml-1" />
                )}
              </button>

              <button
                onClick={next}
                aria-label={t.player.next}
                className="p-3 text-[var(--foreground-muted)] hover:text-white"
              >
                <SkipForward className="w-8 h-8 fill-current" />
              </button>
            </div>

            {/* Volume slider */}
            <div className="flex items-center gap-3 px-4">
              <button onClick={toggleMute} aria-label={isMuted ? t.player.unmute : t.player.mute}>
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-white/50" /> : <Volume2 className="w-5 h-5 text-white/50" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                aria-label={t.player.volume}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= SLEEP TIMER MODAL ================= */}
      {showTimerModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-sm rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] p-6 shadow-2xl relative">
            <button
              onClick={() => setShowTimerModal(false)}
              aria-label={t.actions.close}
              className="absolute top-4 right-4 p-1 rounded-lg text-[var(--foreground-muted)] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-indigo-400">
              <Timer className="w-5 h-5" />
              <h3 className="font-bold text-lg text-[var(--foreground)]">{t.sleepTimer.title}</h3>
            </div>
            <p className="text-xs text-[var(--foreground-muted)] mb-5">{t.sleepTimer.subtitle}</p>

            {sleepTimer.isActive ? (
              <div className="text-center py-4 bg-indigo-950/40 border border-indigo-800/60 rounded-xl mb-4">
                <p className="text-xs text-indigo-300 mb-1">
                  {sleepTimer.isFadingOut ? t.sleepTimer.fadingOut : t.sleepTimer.activeCountdown.replace("{time}", "")}
                </p>
                <p className="text-3xl font-extrabold text-white tracking-wider font-mono">
                  {formatDuration(sleepTimer.remainingSeconds)}
                </p>
                <button
                  onClick={() => {
                    sleepTimer.cancelTimer();
                  }}
                  className="mt-4 px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold"
                >
                  {t.sleepTimer.cancel}
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <span className="text-xs font-semibold text-[var(--foreground)] mb-2 block">
                    {t.sleepTimer.presets}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 15, 30, 45, 60, 90].map((min) => (
                      <button
                        key={min}
                        onClick={() => {
                          sleepTimer.setTimer(min);
                          setShowTimerModal(false);
                        }}
                        className="p-2.5 rounded-xl border border-[var(--surface-border)] hover:border-indigo-500 bg-white/5 hover:bg-indigo-600/20 text-xs font-semibold text-[var(--foreground)] transition-colors"
                      >
                        {interpolate(t.sleepTimer.minutes, { min })}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[var(--surface-border)] pt-4">
                  <span className="text-xs font-semibold text-[var(--foreground)] mb-2 block">
                    {t.sleepTimer.custom}
                  </span>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const val = parseInt(customMinutes, 10);
                      if (val > 0 && val <= 180) {
                        sleepTimer.setTimer(val);
                        setShowTimerModal(false);
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="number"
                      min="1"
                      max="180"
                      placeholder={t.sleepTimer.customPlaceholder}
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-[var(--surface-border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-hidden focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!customMinutes}
                      className="px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold disabled:opacity-50"
                    >
                      {t.sleepTimer.start}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
