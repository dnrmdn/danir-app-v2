"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Folder, Image as ImageIcon, Link2, Plus, Save, X } from "lucide-react";
import { getThumbnailUrl } from "@/lib/link-utils";
import { useLanguage } from "@/components/language-provider";

const contentModalLocal = {
  id: {
    saveNewLink: "Simpan link baru",
    addLink: "Tambah Link",
    linkPreview: "Pratinjau link",
    previewDetails: "Pratinjau & detail",
    previewReadyDesc: "Pratinjau sudah terbaca. Tinggal isi judul dan label biar rapi.",
    pasteDesc: "Tempel link dari platform mana saja, lalu lanjut ke pratinjau sebelum disimpan.",
    urlLabel: "URL / Link",
    urlPlaceholder: "https://instagram.com/p/... atau link platform lain",
    cancel: "Batal",
    nextStep: "Langkah berikut",
    fetchingPreview: "Mengambil pratinjau...",
    detectedPreview: "Pratinjau terdeteksi",
    changeLink: "Ganti link",
    addTitle: "Tambah judul",
    titlePlaceholder: "Beri judul yang mudah dicari nanti",
    addLabelFolder: "Tambah label / folder",
    addNewLabelPlaceholder: "Tambah label baru...",
    selectedLabel: "Dipilih",
    saving: "Menyimpan...",
    saveLink: "Simpan link",
    errorInvalidUrl: "URL-nya sepertinya belum valid. Coba cek lagi ya.",
    errorSaveFailed: "Gagal menyimpan link.",
  },
  en: {
    saveNewLink: "Save new link",
    addLink: "Add Link",
    linkPreview: "Link preview",
    previewDetails: "Preview & details",
    previewReadyDesc: "Preview is ready. Fill in the title and label to keep things organized.",
    pasteDesc: "Paste a link from any platform, then continue to the preview before saving.",
    urlLabel: "URL / Link",
    urlPlaceholder: "https://instagram.com/p/... or any other link",
    cancel: "Cancel",
    nextStep: "Next step",
    fetchingPreview: "Fetching preview...",
    detectedPreview: "Detected preview",
    changeLink: "Change link",
    addTitle: "Add title",
    titlePlaceholder: "Give it a title that's easy to find later",
    addLabelFolder: "Add label / folder",
    addNewLabelPlaceholder: "Add new label...",
    selectedLabel: "Selected",
    saving: "Saving...",
    saveLink: "Save link",
    errorInvalidUrl: "The URL doesn't seem valid. Please check again.",
    errorSaveFailed: "Failed to save link.",
  },
};

type CreatedSavedLink = {
  id: number;
  url: string;
  title: string;
  label: string | null;
  previewImage: string | null;
  createdAt?: string;
};

type AddLinkModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (link: CreatedSavedLink) => void;
};

const DEFAULT_LABELS = ["Work", "Education", "Personal", "Entertainment"];
const FALLBACK_PREVIEW =
  "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&h=225&auto=format&fit=crop";

export default function AddLinkModal({ isOpen, onClose, onCreated }: AddLinkModalProps) {
  const { locale } = useLanguage();
  const t = contentModalLocal[locale];
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
        const res = await fetch("/api/labels", { cache: "no-store" });
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

    void fetchLabels();
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
      let preview = FALLBACK_PREVIEW;
      let fetchedTitle = "";

      try {
        const res = await fetch(`/api/link-preview?url=${encodeURIComponent(cleanUrl)}`);
        const data = await res.json();
        
        if (data.success && data.data) {
          if (data.data.image) preview = data.data.image;
          if (data.data.title) fetchedTitle = data.data.title;
        } else {
          // fallback if api fails
          preview = getThumbnailUrl(cleanUrl);
        }
      } catch {
        preview = getThumbnailUrl(cleanUrl);
      }

      setPreviewImage(preview);
      if (fetchedTitle && !title) setTitle(fetchedTitle);
      setShowDetails(true);

    } catch {
      setError(t.errorInvalidUrl);
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
      onCreated?.(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorSaveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-background/60 px-4 py-8 backdrop-blur-xl dark:bg-slate-950/75" onClick={handleClose}>
      <div
        className="relative z-[100000] flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-border bg-card text-foreground shadow-[0_30px_120px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-[#08111f]/98 dark:text-white dark:shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 pb-5 pt-6 dark:border-white/10">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">
              <Link2 className="h-3.5 w-3.5" />
              {showDetails ? t.linkPreview : t.saveNewLink}
            </div>
            <h2 className="text-3xl font-black">{showDetails ? t.previewDetails : t.addLink}</h2>
            <p className="mt-2 text-sm text-muted-foreground dark:text-slate-400">
              {showDetails ? t.previewReadyDesc : t.pasteDesc}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="group rounded-full border border-cyan-300/15 bg-cyan-400/10 p-2 text-cyan-700 transition hover:bg-cyan-400/15 active:scale-95 dark:text-cyan-100"
          >
            <X size={18} className="transition-transform duration-200 group-hover:rotate-12 group-active:rotate-90" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <div className="mb-5 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-200">
              {error}
            </div>
          )}

          {!showDetails ? (
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground dark:text-slate-200">{t.urlLabel}</label>
                <div className="relative">
                  <Link2 size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600 dark:text-cyan-200" />
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void handleUrlSubmit();
                      }
                    }}
                    placeholder={t.urlPlaceholder}
                    className="w-full rounded-2xl border border-border bg-muted/50 py-3.5 pl-11 pr-4 text-foreground outline-none placeholder:text-muted-foreground dark:border-white/10 dark:bg-[#07111f]/80 dark:text-white dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={handleClose} className="rounded-2xl border border-border bg-muted/50 px-4 py-2.5 text-muted-foreground hover:bg-muted dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10">
                  {t.cancel}
                </button>
                <button
                  onClick={() => void handleUrlSubmit()}
                  disabled={isFetching || !url.trim()}
                  className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2.5 font-semibold text-cyan-700 hover:bg-cyan-400/15 disabled:opacity-50 dark:text-cyan-100"
                >
                  {isFetching ? t.fetchingPreview : t.nextStep}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-5 rounded-[1.5rem] border border-cyan-300/10 bg-cyan-400/5 p-4 md:flex-row md:items-center">
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted/50 dark:border-white/10 dark:bg-white/5 md:w-56 md:shrink-0">
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
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">{t.detectedPreview}</div>
                  <p className="mt-2 break-all text-sm italic text-muted-foreground dark:text-slate-300">{url}</p>
                  <button
                    type="button"
                    onClick={() => setShowDetails(false)}
                    className="mt-3 inline-flex items-center rounded-full border border-cyan-300/15 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-400/15 dark:text-cyan-100"
                  >
                    {t.changeLink}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground dark:text-slate-200">{t.addTitle}</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.titlePlaceholder}
                  className="w-full rounded-2xl border border-border bg-muted/50 px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground dark:border-white/10 dark:bg-[#07111f]/80 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground dark:text-slate-200">
                  <Folder size={16} className="text-amber-600 dark:text-amber-200" />
                  {t.addLabelFolder}
                </label>

                <div className="flex min-h-[56px] flex-wrap gap-2 rounded-2xl border border-border bg-muted/30 p-3 dark:border-white/10 dark:bg-[#07111f]/70">
                  {existingLabels.map((label) => {
                    const active = labels.includes(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleLabel(label)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          active
                            ? "border border-cyan-300/20 bg-cyan-400/15 text-cyan-700 dark:text-cyan-100"
                            : "border border-border bg-muted/50 text-muted-foreground hover:bg-muted dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
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
                    placeholder={t.addNewLabelPlaceholder}
                    className="w-full rounded-2xl border border-border bg-muted/50 px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground dark:border-white/10 dark:bg-[#07111f]/80 dark:text-white dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={addNewLabel}
                    className="rounded-2xl border border-border bg-muted/50 px-4 text-muted-foreground hover:bg-muted dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {labels.length > 0 && <p className="text-xs text-muted-foreground dark:text-slate-400">{t.selectedLabel}: {selectedLabelsValue}</p>}
              </div>
            </div>
          )}
        </div>

        {showDetails && (
          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-border bg-card px-6 py-4 dark:border-white/10 dark:bg-[#08111f]/98">
            <button onClick={handleClose} className="rounded-2xl border border-border bg-muted/50 px-4 py-2.5 text-muted-foreground hover:bg-muted dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10">
              {t.cancel}
            </button>
            <button
              onClick={() => void handleSave()}
              disabled={isSaving || !title.trim() || labels.length === 0}
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2.5 font-semibold text-cyan-700 hover:bg-cyan-400/15 disabled:opacity-50 dark:text-cyan-100"
            >
              <Save size={16} />
              {isSaving ? t.saving : t.saveLink}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
