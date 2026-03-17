"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link2, Tag, Type, X } from "lucide-react";

export default function AddLinkModal({ isOpen, onClose, onCreated }: { isOpen: boolean; onClose: () => void; onCreated?: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [labels, setLabels] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async () => {
    if (!url.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          title,
          label: labels,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to save link");

      setUrl("");
      setTitle("");
      setLabels("");
      onClose();
      onCreated?.();
    } catch (error) {
      console.error(error);
      alert("Failed to save link.");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-xl" onClick={onClose}>
      <div className="relative z-[100000] flex max-h-[85vh] w-full max-w-2xl flex-col rounded-[2rem] border border-white/10 bg-[#08111f]/98 text-white shadow-[0_30px_120px_rgba(0,0,0,0.55)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Create</div>
            <h2 className="mt-1 text-3xl font-black">Add Link</h2>
          </div>
          <button onClick={onClose} className="group rounded-full border border-cyan-300/15 bg-cyan-400/10 p-2 text-cyan-100 transition hover:bg-cyan-400/15 active:scale-95">
            <X size={18} className="transition-transform duration-200 group-hover:rotate-12 group-active:rotate-90" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Link URL</label>
              <div className="relative">
                <Link2 size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-200" />
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full rounded-2xl border border-white/10 bg-[#07111f]/80 py-3 pl-11 pr-4 text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Title</label>
              <div className="relative">
                <Type size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-violet-200" />
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Optional title"
                  className="w-full rounded-2xl border border-white/10 bg-[#07111f]/80 py-3 pl-11 pr-4 text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Labels</label>
              <div className="relative">
                <Tag size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-amber-200" />
                <input
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                  placeholder="design, ui, docs"
                  className="w-full rounded-2xl border border-white/10 bg-[#07111f]/80 py-3 pl-11 pr-4 text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-white/10 bg-[#08111f]/98 px-6 py-4">
          <button onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-200 hover:bg-white/10">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2.5 font-semibold text-cyan-100 hover:bg-cyan-400/15 disabled:opacity-50">
            {saving ? "Saving..." : "Save link"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
