"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Folder, Image as ImageIcon, Link2, Plus, Save, X } from "lucide-react";
import { getThumbnailUrl } from "@/lib/link-utils";

type AddLinkModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

const DEFAULT_LABELS = ["Work", "Education", "Personal", "Entertainment"];
const FALLBACK_PREVIEW =
  "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&h=225&auto=format&fit=crop";

export default function AddLinkModal({ isOpen, onClose, onCreated }: AddLinkModalProps) {
  const [mounted, setMounted] = useState(false);
  const [url, setUrl] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [title, setTitle] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [existingLabels, setExistingLabels] = useState<string[]>(DEFAULT_LABELS);
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const fetchLabels = async () => {
      try {
        const res = await fetch("/api/labels");
        const data = await res.json();

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setExistingLabels(Array.from(new Set([...DEFAULT_LABELS, ...data.data])).sort());
        } else {
          setExistingLabels(DEFAULT_LABELS);
        }
      } catch {
        setExistingLabels(DEFAULT_LABELS);
      }
    };

    fetchLabels();
    setError(null);
  }, [isOpen]);

  const selectedLabelsValue = useMemo(() => labels.join(", "), [labels]);

  const resetForm = () => {
    setUrl("");
    setShowDetails(false);
    setTitle("");
    setPreviewImage("");
    setLabels([]);
    setNewLabel("");
    setError(null);
    setIsFetching(false);
    setIsSaving(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleUrlSubmit = async () => {
    if (!url.trim()) return;

    setIsFetching(true);
    setError(null);

    try {
      const cleanUrl = url.trim();
      const preview = getThumbnailUrl(cleanUrl);

      setPreviewImage(preview);
      setShowDetails(true);
    } catch {
      setError("URL-nya kayaknya belum valid. Coba cek lagi ya.");
    } finally {
      setIsFetching(false);
    }
  };

  const toggleLabel = (label: string) => {
    setLabels((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]));
  };

  const addNewLabel = () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;

    if (!existingLabels.includes(trimmed)) {
      setExistingLabels((prev) => [...prev, trimmed].sort());
    }

    setLabels((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setNewLabel("");
  };

  const handleSave = async () => {
    if (!url.trim() || !title.trim() || labels.length === 0) return;

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          title: title.trim(),
          labels: selectedLabelsValue,
          previewImage,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save link");
      }

      handleClose();
      onCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal nyimpen link.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-xl" onClick={handleClose}>
      <div
        className="relative z-[100000] flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#08111f]/98 text-white shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 pb-5 pt-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <Link2 className="h-3.5 w-3.5" />
              {showDetails ? "Link preview" : "Save new link"}
            </div>
            <h2 className="text-3xl font-black">{showDetails ? "Preview & details" : "Add Link"}</h2>
            <p className="mt-2 text-sm text-slate-400">
              {showDetails
                ? "Preview-nya udah kebaca. Tinggal isi title dan label/folder biar rapi."
                : "Paste link dari platform apa aja, terus lanjut ke preview sebelum disimpan."}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="group rounded-full border border-cyan-300/15 bg-cyan-400/10 p-2 text-cyan-100 transition hover:bg-cyan-400/15 active:scale-95"
          >
            <X size={18} className="transition-transform duration-200 group-hover:rotate-12 group-active:rotate-90" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <div className="mb-5 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
              {error}
            </div>
          )}

          {!showDetails ? (
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">URL / Link</label>
                <div className="relative">
                  <Link2 size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-200" />
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void handleUrlSubmit();
                      }
                    }}
                    placeholder="https://instagram.com/p/... atau link platform lain"
                    className="w-full rounded-2xl border border-white/10 bg-[#07111f]/80 py-3.5 pl-11 pr-4 text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={handleClose} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-200 hover:bg-white/10">
                  Cancel
                </button>
                <button
                  onClick={() => void handleUrlSubmit()}
                  disabled={isFetching || !url.trim()}
                  className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2.5 font-semibold text-cyan-100 hover:bg-cyan-400/15 disabled:opacity-50"
                >
                  {isFetching ? "Fetching preview..." : "Next step"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-5 rounded-[1.5rem] border border-cyan-300/10 bg-cyan-400/5 p-4 md:flex-row md:items-center">
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:w-56 md:shrink-0">
                  <Image
                    src={previewImage || FALLBACK_PREVIEW}
                    alt="Link preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 224px"
                    unoptimized
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition group-hover:opacity-100">
                    <ImageIcon className="text-white" size={24} />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-200">Detected preview</div>
                  <p className="mt-2 break-all text-sm italic text-slate-300">{url}</p>
                  <button
                    type="button"
                    onClick={() => setShowDetails(false)}
                    className="mt-3 inline-flex items-center rounded-full border border-cyan-300/15 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-400/15"
                  >
                    Change link
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Add title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Kasih judul yang gampang dicari nanti"
                  className="w-full rounded-2xl border border-white/10 bg-[#07111f]/80 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Folder size={16} className="text-amber-200" />
                  Add label / folder
                </label>

                <div className="flex min-h-[56px] flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#07111f]/70 p-3">
                  {existingLabels.map((label) => {
                    const active = labels.includes(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleLabel(label)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          active
                            ? "border border-cyan-300/20 bg-cyan-400/15 text-cyan-100"
                            : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <input
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addNewLabel();
                      }
                    }}
                    placeholder="Tambah label baru..."
                    className="w-full rounded-2xl border border-white/10 bg-[#07111f]/80 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={addNewLabel}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 text-slate-200 hover:bg-white/10"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {labels.length > 0 && (
                  <p className="text-xs text-slate-400">Selected: {selectedLabelsValue}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {showDetails && (
          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-white/10 bg-[#08111f]/98 px-6 py-4">
            <button onClick={handleClose} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-200 hover:bg-white/10">
              Cancel
            </button>
            <button
              onClick={() => void handleSave()}
              disabled={isSaving || !title.trim() || labels.length === 0}
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2.5 font-semibold text-cyan-100 hover:bg-cyan-400/15 disabled:opacity-50"
            >
              <Save size={16} />
              {isSaving ? "Saving..." : "Save link"}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
