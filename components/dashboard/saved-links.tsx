"use client";

import { Link2, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";

// Dummy Data untuk preview langsung
const DUMMY_LINKS = [
  {
    id: 1,
    url: "https://nextjs.org",
    title: "Next.js Documentation",
    label: "coding, webdev",
    previewImage: null,
  },
  {
    id: 2,
    url: "https://tailwindcss.com",
    title: "Tailwind CSS Components",
    label: "design, ui",
    previewImage: null,
  },
  {
    id: 3,
    url: "https://lucide.dev",
    title: "Lucide React Icons",
    label: "resource",
    previewImage: null,
  },
];

interface SavedLink {
  id: number;
  url: string;
  title: string;
  label: string | null;
  previewImage: string | null;
}

export function SavedLinks() {
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulasi fetch data dengan dummy
    const timer = setTimeout(() => {
      setLinks(DUMMY_LINKS);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-6 shadow-xl shadow-cyan-950/5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:shadow-cyan-950/10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:border-cyan-400/20 dark:text-cyan-200">
            <Link2 className="h-3.5 w-3.5" />
            Knowledge vault
          </div>
          <h3 className="mb-2 text-xl font-semibold text-foreground dark:text-white">Saved Links</h3>
          <p className="text-sm text-muted-foreground dark:text-slate-300">Save useful videos, references, and content you want to revisit fast.</p>
        </div>
        <Link href="/saved-links" className="inline-flex items-center gap-1 text-xs font-medium text-cyan-600 hover:text-cyan-800 dark:text-cyan-200 dark:hover:text-white">
          View all <ExternalLink size={12} />
        </Link>
      </div>

      <div className="flex-1 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-full animate-pulse rounded-2xl bg-muted dark:bg-white/5" />
            ))}
          </div>
        ) : links.length > 0 ? (
          links.map((link) => (
            <div
              key={link.id}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-background p-3 transition hover:border-cyan-400/40 hover:bg-accent dark:border-white/10 dark:bg-slate-950/50 dark:hover:border-cyan-400/20 dark:hover:bg-white/5"
            >
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-muted dark:bg-white/5">
                <Image
                  src={link.previewImage || `https://api.microlink.io/?url=${encodeURIComponent(link.url)}&screenshot=true&embed=screenshot.url`}
                  alt=""
                  fill
                  sizes="64px"
                  unoptimized
                  className="object-cover opacity-80 group-hover:opacity-100"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground dark:text-white">{link.title}</p>
                <div className="mt-1 flex gap-1 overflow-hidden">
                  {link.label ? (
                    link.label.split(",").map((l, i) => (
                      <span key={i} className="max-w-[68px] truncate rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-medium text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-200">
                        {l.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-muted-foreground">No label</span>
                  )}
                </div>
              </div>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="rounded-xl p-2 text-muted-foreground transition hover:bg-cyan-100 hover:text-cyan-700 dark:text-cyan-200 dark:hover:bg-cyan-400/10 dark:hover:text-white">
                <ExternalLink size={16} />
              </a>
            </div>
          ))
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-8 text-center dark:border-white/10 dark:bg-slate-950/40">
            <Link2 size={24} className="mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">No links saved yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
