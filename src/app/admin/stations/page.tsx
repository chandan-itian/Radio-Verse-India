"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { useI18n } from "@/lib/i18n";
import {
  getAllStations,
  addCustomStation,
  deleteStation,
} from "@/lib/stations-store";
import { StationItem } from "@/types/station";
import {
  Radio,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function AdminStationsPage() {
  const { t } = useI18n();
  const [stations, setStations] = useState<StationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStation, setEditStation] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("hindi");
  const [state, setState] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [streamType, setStreamType] = useState<"hls" | "mp3" | "aac" | "unknown">("unknown");
  const [homepageUrl, setHomepageUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadAllStations = () => {
    setLoading(true);
    // 1. Immediately read all active stations from stations store
    const local = getAllStations();
    setStations(local);
    setLoading(false);

    // 2. Try online sync if backend API is available
    try {
      fetch("/api/v1/admin/stations?limit=100")
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((json) => {
          if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
            const serverList = json.data;
            const seen = new Set<string>();
            const combined: StationItem[] = [];
            for (const st of [...serverList, ...local]) {
              if (!seen.has(st.id)) {
                seen.add(st.id);
                combined.push(st);
              }
            }
            setStations(combined);
          }
        })
        .catch(() => {
          // Offline / static mode - local is already populated!
        });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadAllStations();

    const handleUpdated = () => {
      loadAllStations();
    };

    window.addEventListener("radioverse_stations_updated", handleUpdated);
    return () => {
      window.removeEventListener("radioverse_stations_updated", handleUpdated);
    };
  }, []);

  const resetForm = () => {
    setName("");
    setLanguage("hindi");
    setState("");
    setStreamUrl("");
    setStreamType("unknown");
    setHomepageUrl("");
    setLogoUrl("");
    setDescription("");
    setIsFeatured(false);
    setFormError("");
    setEditStation(null);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Station name is required.");
      return;
    }

    if (!streamUrl.trim()) {
      setFormError("Stream URL is required.");
      return;
    }

    setSubmitting(true);

    try {
      if (editStation) {
        // Editing existing station
        // In local mode, if it's a custom station or override, update in localStorage
        const customStationsRaw = localStorage.getItem("radioverse_custom_stations");
        let customStations: StationItem[] = customStationsRaw ? JSON.parse(customStationsRaw) : [];

        const existingIdx = customStations.findIndex((s) => s.id === editStation.id);
        const updatedItem: StationItem = {
          ...editStation,
          name: name.trim(),
          language: language.toLowerCase().trim(),
          state: state.trim() || null,
          homepageUrl: homepageUrl.trim() || null,
          logoUrl: logoUrl.trim() || null,
          description: description.trim() || null,
          isFeatured,
          endpoints: [
            {
              id: editStation.endpoints?.[0]?.id || `ep-${editStation.id}`,
              streamUrl: streamUrl.trim(),
              streamType: streamType === "unknown" ? (streamUrl.includes(".m3u8") ? "hls" : "mp3") : streamType,
              codec: "MP3",
              bitrate: 128,
              authorizationStatus: "verified_playable",
              verificationStatus: "healthy",
              priority: 1,
            },
          ],
        };

        if (existingIdx >= 0) {
          customStations[existingIdx] = updatedItem;
        } else {
          customStations.unshift(updatedItem);
        }
        localStorage.setItem("radioverse_custom_stations", JSON.stringify(customStations));

        // Try backend PATCH if API is running
        try {
          fetch(`/api/v1/admin/stations/${editStation.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              language,
              state: state || null,
              streamUrl: streamUrl || undefined,
              homepageUrl: homepageUrl || null,
              logoUrl: logoUrl || null,
              description: description || null,
              isFeatured,
            }),
          }).catch(() => {});
        } catch {}

        setSuccessMsg(`Station "${name}" updated successfully!`);
      } else {
        // Manual Add Station:
        addCustomStation({
          name,
          language,
          state: state || undefined,
          streamUrl,
          streamType,
          homepageUrl: homepageUrl || undefined,
          logoUrl: logoUrl || undefined,
          description: description || undefined,
          isFeatured,
        });

        setSuccessMsg(`Station "${name}" added successfully to the catalog!`);
      }

      setShowAddModal(false);
      resetForm();
      loadAllStations();

      setTimeout(() => {
        setSuccessMsg("");
      }, 5000);
    } catch (err: any) {
      setFormError(err.message || "Failed to save station.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string, stationName: string) => {
    if (confirm(`Are you sure you want to remove "${stationName}" from the catalog?`)) {
      deleteStation(id);
      loadAllStations();
      setSuccessMsg(`Station "${stationName}" removed from catalog.`);
      setTimeout(() => setSuccessMsg(""), 4000);

      // Attempt backend delete if running
      try {
        fetch(`/api/v1/admin/stations/${id}`, { method: "DELETE" }).catch(() => {});
      } catch {}
    }
  };

  const openEdit = (st: any) => {
    setEditStation(st);
    setName(st.name);
    setLanguage(st.language);
    setState(st.state || "");
    setStreamUrl(st.endpoints?.[0]?.streamUrl || "");
    setStreamType(st.endpoints?.[0]?.streamType || "unknown");
    setHomepageUrl(st.homepageUrl || "");
    setLogoUrl(st.logoUrl || "");
    setDescription(st.description || "");
    setIsFeatured(Boolean(st.isFeatured));
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      <AdminHeader />

      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">{t.admin.stations}</h1>
          <p className="text-xs text-[var(--foreground-muted)]">
            Manage station records, live audio streams, broadcaster metadata, and custom additions.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-indigo-500/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Manual Add Station (स्टेशन जोड़ें)</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
          <p className="text-xs text-[var(--foreground-muted)]">Loading station catalog...</p>
        </div>
      ) : stations.length === 0 ? (
        <div className="py-20 text-center p-6 rounded-3xl bg-[var(--surface)] border border-[var(--surface-border)]">
          <p className="text-sm font-bold text-[var(--foreground)]">No station records found.</p>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Manual Add Station
          </button>
        </div>
      ) : (
        <div className="rounded-3xl bg-[var(--surface)] border border-[var(--surface-border)] overflow-hidden shadow-xs">
          <div className="p-4 bg-white/5 border-b border-[var(--surface-border)] flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--foreground)]">
              All Indian & Regional Stations ({stations.length})
            </span>
            <span className="text-[11px] text-[var(--foreground-muted)]">
              Active in Discovery & Audio Engine
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-[var(--surface-border)] text-[var(--foreground-muted)]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Station Name</th>
                  <th className="py-3 px-4 font-semibold">Language / State</th>
                  <th className="py-3 px-4 font-semibold">Stream Endpoint</th>
                  <th className="py-3 px-4 font-semibold">Source</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--surface-border)]">
                {stations.map((st) => {
                  const ep = st.endpoints?.[0];
                  const isCustom = st.externalSource === "admin" || st.id.startsWith("custom-");
                  return (
                    <tr key={st.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-[var(--foreground)]">{st.name}</div>
                          {st.isFeatured && (
                            <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold bg-amber-500/20 text-amber-300">
                              FEATURED
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">{st.slug}</span>
                      </td>
                      <td className="py-3 px-4 capitalize">
                        <span className="font-medium text-[var(--foreground)]">{st.language}</span>
                        {st.state ? <span className="text-[var(--foreground-muted)]"> • {st.state}</span> : ""}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-[var(--foreground-muted)] font-mono text-[11px]">
                        {ep?.streamUrl || "No endpoint"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                            isCustom
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : "bg-blue-500/10 text-blue-300"
                          }`}
                        >
                          {isCustom ? "CUSTOM (MANUAL)" : "CURATED"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-500/15 text-emerald-400">
                          ACTIVE
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(st)}
                            aria-label={t.actions.edit}
                            title="Edit station"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(st.id, st.name)}
                            aria-label={t.actions.delete}
                            title="Delete station"
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Add / Edit Station Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-lg rounded-3xl bg-[var(--surface)] border border-[var(--surface-border)] p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="absolute top-4 right-4 p-1.5 text-[var(--foreground-muted)] hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <Radio className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-lg text-[var(--foreground)]">
                {editStation ? "Edit Station Details" : "Manual Add Station (स्टेशन जोड़ें)"}
              </h3>
            </div>
            <p className="text-xs text-[var(--foreground-muted)] mb-4">
              Enter Indian or International radio broadcast metadata. The stream will immediately become playable and persist in the application catalog.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateOrUpdate} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-[var(--foreground)] block mb-1">
                  Station Name * (स्टेशन का नाम)
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Red FM 93.5 or Radio City Hindi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--surface-border)] text-[var(--foreground)] focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[var(--foreground)] block mb-1">
                    Language * (भाषा)
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--surface-border)] text-[var(--foreground)] capitalize font-medium"
                  >
                    <option value="hindi">Hindi (हिंदी)</option>
                    <option value="punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                    <option value="bhojpuri">Bhojpuri (भोजपुरी)</option>
                    <option value="tamil">Tamil (தமிழ்)</option>
                    <option value="telugu">Telugu (తెలుగు)</option>
                    <option value="marathi">Marathi (मराठी)</option>
                    <option value="gujarati">Gujarati (ગુજરાતી)</option>
                    <option value="bengali">Bengali (বাংলা)</option>
                    <option value="kannada">Kannada (ಕನ್ನಡ)</option>
                    <option value="malayalam">Malayalam (മലയാളം)</option>
                    <option value="odia">Odia (ଓଡ଼ିଆ)</option>
                    <option value="english">English</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[var(--foreground)] block mb-1">
                    State / Region (राज्य / क्षेत्र)
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Delhi NCR, Maharashtra, Bihar"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--surface-border)] text-[var(--foreground)] focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[var(--foreground)] block mb-1">
                  Live Stream URL * (लाइव स्ट्रीम URL - MP3 / HLS / AAC)
                </label>
                <input
                  type="url"
                  required
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="https://stream.zeno.fm/f3wvbbqmdg8uv or https://.../playlist.m3u8"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--surface-border)] text-[var(--foreground)] font-mono text-[11px] focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[var(--foreground)] block mb-1">
                    Stream Format (फॉर्मेट)
                  </label>
                  <select
                    value={streamType}
                    onChange={(e) => setStreamType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--surface-border)] text-[var(--foreground)] font-medium"
                  >
                    <option value="unknown">Auto-Detect</option>
                    <option value="mp3">MP3 Live Audio</option>
                    <option value="hls">HLS Stream (.m3u8)</option>
                    <option value="aac">AAC Stream</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[var(--foreground)] block mb-1">
                    Featured Placement
                  </label>
                  <div className="pt-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-[var(--foreground)]">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="rounded-sm accent-indigo-500 w-4 h-4"
                      />
                      <span className="font-medium">Pin to Homepage</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[var(--foreground)] block mb-1">
                  Logo / Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--surface-border)] text-[var(--foreground)] focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-[var(--foreground)] block mb-1">
                  Description / RJ Show Notes
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Superhit Bollywood songs, comedy shows, and live RJs..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--background)] border border-[var(--surface-border)] text-[var(--foreground)] focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--surface-border)] bg-white/5 hover:bg-white/10 font-semibold text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  {t.actions.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editStation ? (
                    "Update Station"
                  ) : (
                    "Save Station (सेव करें)"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
