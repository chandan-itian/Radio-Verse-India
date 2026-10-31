"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { useI18n } from "@/lib/i18n";
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
} from "lucide-react";

export default function AdminStationsPage() {
  const { t } = useI18n();
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStation, setEditStation] = useState<any>(null);

  // Form fields
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("hindi");
  const [state, setState] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [streamType, setStreamType] = useState("unknown");
  const [homepageUrl, setHomepageUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/stations?limit=100");
      if (res.ok) {
        const json = await res.json();
        setStations(json.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
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
    setSubmitting(true);

    try {
      if (editStation) {
        // PATCH
        const res = await fetch(`/api/v1/admin/stations/${editStation.id}`, {
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
        });

        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || "Update failed.");
          setSubmitting(false);
          return;
        }
      } else {
        // POST
        const res = await fetch("/api/v1/admin/stations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            language,
            state: state || null,
            streamUrl,
            streamType,
            homepageUrl: homepageUrl || null,
            logoUrl: logoUrl || null,
            description: description || null,
            isFeatured,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || "Creation failed.");
          setSubmitting(false);
          return;
        }
      }

      setShowAddModal(false);
      resetForm();
      fetchStations();
    } catch {
      setFormError("Network communication error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, stationName: string) => {
    if (confirm(`Are you sure you want to delete "${stationName}"? This action is audited.`)) {
      try {
        const res = await fetch(`/api/v1/admin/stations/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchStations();
        } else {
          const err = await res.json();
          alert(err.error || "Delete failed");
        }
      } catch {
        alert("Failed to delete station");
      }
    }
  };

  const openEdit = (st: any) => {
    setEditStation(st);
    setName(st.name);
    setLanguage(st.language);
    setState(st.state || "");
    setStreamUrl(st.endpoints[0]?.streamUrl || "");
    setStreamType(st.endpoints[0]?.streamType || "unknown");
    setHomepageUrl(st.homepageUrl || "");
    setLogoUrl(st.logoUrl || "");
    setDescription(st.description || "");
    setIsFeatured(Boolean(st.isFeatured));
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      <AdminHeader />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">{t.admin.stations}</h1>
          <p className="text-xs text-[var(--foreground-muted)]">
            Manage station records, authorized stream URLs, and broadcaster credentials.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.admin.addStation}</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
          <p className="text-xs text-[var(--foreground-muted)]">Loading station catalog...</p>
        </div>
      ) : stations.length === 0 ? (
        <div className="py-20 text-center p-6 rounded-3xl bg-[var(--surface)] border border-[var(--surface-border)]">
          <p className="text-sm font-bold text-[var(--foreground)]">No station records found.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-3 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold"
          >
            Add First Station
          </button>
        </div>
      ) : (
        <div className="rounded-3xl bg-[var(--surface)] border border-[var(--surface-border)] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-[var(--surface-border)] text-[var(--foreground-muted)]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Station Name</th>
                  <th className="py-3 px-4 font-semibold">Language / State</th>
                  <th className="py-3 px-4 font-semibold">Stream Endpoint</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--surface-border)]">
                {stations.map((st) => {
                  const ep = st.endpoints[0];
                  return (
                    <tr key={st.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[var(--foreground)]">{st.name}</div>
                        <span className="text-[10px] text-slate-500">{st.slug}</span>
                      </td>
                      <td className="py-3 px-4 capitalize">
                        {st.language} {st.state ? `• ${st.state}` : ""}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-[var(--foreground-muted)] font-mono text-[11px]">
                        {ep?.streamUrl || "No endpoint"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            st.status === "active"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-red-500/15 text-red-400"
                          }`}
                        >
                          {st.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(st)}
                            aria-label={t.actions.edit}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(st.id, st.name)}
                            aria-label={t.actions.delete}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"
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

      {/* Add / Edit Station Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] border border-[var(--surface-border)] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="absolute top-4 right-4 p-1 text-[var(--foreground-muted)] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-[var(--foreground)] mb-1">
              {editStation ? t.admin.editStation : t.admin.addStation}
            </h3>
            <p className="text-xs text-[var(--foreground-muted)] mb-4">
              Enter valid broadcaster metadata. Stream URLs are validated against SSRF restrictions.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateOrUpdate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[var(--foreground)] block mb-1">Station Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AIR Vividh Bharati"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--surface-border)] text-[var(--foreground)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[var(--foreground)] block mb-1">Language</label>
                  <input
                    type="text"
                    required
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="hindi"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--surface-border)] text-[var(--foreground)]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[var(--foreground)] block mb-1">State / Region</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Delhi NCR"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--surface-border)] text-[var(--foreground)]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[var(--foreground)] block mb-1">Stream URL</label>
                <input
                  type="url"
                  required
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="https://example.com/live/stream.m3u8"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--surface-border)] text-[var(--foreground)] font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[var(--foreground)] block mb-1">Stream Type</label>
                  <select
                    value={streamType}
                    onChange={(e) => setStreamType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--surface-border)] text-[var(--foreground)]"
                  >
                    <option value="hls">HLS (.m3u8)</option>
                    <option value="mp3">MP3 Stream</option>
                    <option value="aac">AAC Stream</option>
                    <option value="unknown">Auto-detect</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[var(--foreground)] block mb-1">Featured Station</label>
                  <div className="pt-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="rounded-sm accent-indigo-500"
                      />
                      <span>Pin to Featured</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[var(--foreground)] block mb-1">Broadcaster Website (Optional)</label>
                <input
                  type="url"
                  value={homepageUrl}
                  onChange={(e) => setHomepageUrl(e.target.value)}
                  placeholder="https://broadcaster.com"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--surface-border)] text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="font-semibold text-[var(--foreground)] block mb-1">Logo URL (Optional)</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--surface-border)] text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="font-semibold text-[var(--foreground)] block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief station background and schedule notes..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--surface-border)] text-[var(--foreground)]"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--surface-border)] bg-white/5 hover:bg-white/10 font-semibold text-[var(--foreground)]"
                >
                  {t.actions.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t.actions.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
