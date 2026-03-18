"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Copy, ExternalLink, Filter, FolderKanban, Grid3X3, Link2, Search, Sparkles, Tag, TableProperties } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserSession } from "@/hooks/useUserSession";
import { getThumbnailUrl } from "@/lib/link-utils";
import AddLinkModal from "@/components/saved-links/add-link-modal";

type SavedLink = {
  id: number;
  url: string;
  title: string;
  label: string | null;
  previewImage: string | null;
  createdAt?: string;
};

type FilterType = "all" | "labeled" | "unlabeled" | "recent";

export default function SavedLinksPage() {
  const { session } = useUserSession();
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<FilterType>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);

  const fetchLinks = async () => {
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      if (data.success) {
        setLinks(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch links:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchLinks();
    } else {
      setLoading(false);
    }
  }, [session]);

  const allLabels = useMemo(() => {
    const raw = links.flatMap((link) => (link.label ? link.label.split(",").map((item) => item.trim()) : []));
    return Array.from(new Set(raw)).filter(Boolean);
  }, [links]);

  const topDomains = useMemo(() => {
    const counts = new Map<string, number>();
    links.forEach((link) => {
      try {
        const domain = new URL(link.url).hostname.replace(/^www\./, "");
        counts.set(domain, (counts.get(domain) ?? 0) + 1);
      } catch {
        // ignore bad url parsing
      }
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [links]);

  const filteredLinks = useMemo(() => {
    const query = search.toLowerCase().trim();

    return links.filter((link) => {
      const matchesSearch = !query || link.title.toLowerCase().includes(query) || link.url.toLowerCase().includes(query) || (link.label || "").toLowerCase().includes(query);

      const hasLabel = !!link.label?.trim();
      const matchesFilter = filter === "all" ? true : filter === "labeled" ? hasLabel : filter === "unlabeled" ? !hasLabel : true;

      return matchesSearch && matchesFilter;
    });
  }, [links, search, filter]);

  const visibleLinks = useMemo(() => filteredLinks.slice(0, visibleCount), [filteredLinks, visibleCount]);

  useEffect(() => {
    setVisibleCount(24);
  }, [search, filter]);

  const recentCount = links.length;

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (!session) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Card className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-white backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-3">
            <Link2 className="text-cyan-200" />
            <h1 className="text-3xl font-black">Saved Links</h1>
          </div>
          <p className="mb-6 text-slate-300">Login dulu biar bisa buka knowledge vault dan lihat koleksi link yang tersimpan.</p>
          <Button asChild className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 font-semibold text-cyan-100 hover:bg-cyan-400/15">
            <a href="/login">Login</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 pb-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-white shadow-2xl shadow-cyan-950/10 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                Saved Links v2
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Build your own knowledge vault.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">Save articles, videos, references, and useful finds in one organized library that is easy to scan and reuse.</p>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={() => setShowAddModal(true)} className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 font-semibold text-cyan-100 hover:bg-cyan-400/15">
                Add new link
              </Button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-4 gap-1.5 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title="Total links" value={String(links.length)} subtitle="Your saved references across the vault" icon={<Link2 className="h-3 w-3 text-cyan-200 sm:h-5 sm:w-5" />} />
          <SummaryCard title="Labels used" value={String(allLabels.length)} subtitle="Organized topics and categories" icon={<Tag className="h-3 w-3 text-violet-200 sm:h-5 sm:w-5" />} />
          <SummaryCard title="Recent saves" value={String(recentCount)} subtitle="Current collection loaded in this page" icon={<Sparkles className="h-3 w-3 text-emerald-200 sm:h-5 sm:w-5" />} />
          <SummaryCard title="Top source" value={topDomains[0]?.[0] || "—"} subtitle={topDomains[0] ? `${topDomains[0][1]} saved link(s)` : "No domain insight yet"} icon={<FolderKanban className="h-3 w-3 text-amber-200 sm:h-5 sm:w-5" />} />
        </section>

        <Card className="!max-w-none rounded-[2rem] border border-white/10 bg-white/5 p-5 text-white backdrop-blur-xl">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, url, or label..." className="h-12 rounded-2xl border-white/10 bg-[#07111f]/80 pl-11 text-white placeholder:text-slate-500" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  ["all", "All"],
                  ["labeled", "Labeled"],
                  ["unlabeled", "Unlabeled"],
                  ["recent", "Recent"],
                ] as Array<[FilterType, string]>
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-full px-4 py-2 text-sm transition ${filter === value ? "bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-300/20" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
                >
                  {label}
                </button>
              ))}

              <div className="ml-1 flex items-center gap-2 rounded-full border border-white/10 bg-[#07111f]/80 p-1">
                <button type="button" onClick={() => setViewMode("grid")} className={`rounded-full p-2 transition ${viewMode === "grid" ? "bg-white text-slate-950" : "text-slate-400 hover:text-white"}`}>
                  <Grid3X3 size={16} />
                </button>
                <button type="button" onClick={() => setViewMode("list")} className={`rounded-full p-2 transition ${viewMode === "list" ? "bg-white text-slate-950" : "text-slate-400 hover:text-white"}`}>
                  <TableProperties size={16} />
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="!max-w-none rounded-[2rem] border border-white/10 bg-white/5 p-5 text-white backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={16} className="text-violet-200" />
            <div>
              <div className="text-lg font-black">Top labels</div>
              <div className="text-sm text-slate-400">Keep your vault organized with the labels you use most.</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {allLabels.length > 0 ? (
              allLabels.slice(0, 12).map((label) => (
                <span key={label} className="rounded-full border border-violet-300/15 bg-violet-400/10 px-3 py-1.5 text-xs text-violet-100">
                  {label}
                </span>
              ))
            ) : (
              <div className="text-sm text-slate-400">No labels yet.</div>
            )}
          </div>
        </Card>

        <Card className="!max-w-none rounded-[2rem] border border-white/10 bg-white/5 p-5 text-white backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xl font-black">All saved links</div>
              <div className="text-sm text-slate-400">Browse your full collection in a cleaner, more organized layout.</div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-8 gap-2 sm:grid-cols-4 xl:grid-cols-8">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-36 animate-pulse rounded-[1rem] bg-white/5" />
              ))}
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-[#07111f]/50 px-4 py-8 text-center text-sm text-slate-400">No links match your current search or filter.</div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-4 sm:gap-2 xl:grid-cols-8">
              {visibleLinks.map((link) => (
                <LinkCard key={link.id} link={link} onCopy={copyLink} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {visibleLinks.map((link) => (
                <ListRow key={link.id} link={link} onCopy={copyLink} />
              ))}
            </div>
          )}

          {filteredLinks.length > visibleCount && (
            <div className="mt-4 flex justify-center sm:mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVisibleCount((prev) => prev + 24)}
                className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-400/15 sm:px-5 sm:text-sm"
              >
                See more
              </Button>
            </div>
          )}
        </Card>
      </div>

      <AddLinkModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={() => {
          setLoading(true);
          fetchLinks();
        }}
      />
    </>
  );
}

function SummaryCard({ title, value, subtitle, icon }: { title: string; value: string; subtitle: string; icon: React.ReactNode }) {
  return (
    <Card className="!max-w-none rounded-[0.75rem] border border-white/10 bg-white/5 px-1.5 py-1.5 text-white backdrop-blur-xl sm:rounded-[1.75rem] sm:p-5">
      <div className="mb-1 flex items-center justify-between sm:mb-4">
        <div className="rounded-md border border-white/10 bg-white/5 p-0.5 sm:rounded-2xl sm:p-3">{icon}</div>
      </div>
      <div className="truncate text-[10px] font-black leading-none text-white sm:text-3xl">{value}</div>
      <div className="mt-0.5 text-[7px] font-semibold leading-2.5 text-slate-200 sm:mt-2 sm:text-sm sm:leading-5">{title}</div>
      <div className="mt-0.5 line-clamp-2 text-[6px] leading-2 text-slate-500 sm:mt-1 sm:text-xs sm:leading-5">{subtitle}</div>
    </Card>
  );
}

function LinkCard({ link, onCopy }: { link: SavedLink; onCopy: (url: string) => void }) {
  const labels = link.label
    ? link.label
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="min-w-0 overflow-hidden rounded-[0.85rem] border border-white/10 bg-[#07111f]/70 transition hover:border-cyan-300/15 hover:bg-white/[0.06] sm:rounded-[1.1rem]">
      {/* IMAGE */}
      <div className="relative w-full h-16 sm:h-20">
        <Image
          src={link.previewImage || getThumbnailUrl(link.url) || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&h=225&auto=format&fit=crop"}
          alt={link.title}
          fill
          sizes="(max-width: 640px) 50vw, 20vw"
          unoptimized
          referrerPolicy="no-referrer"
          className="object-cover"
        />
      </div>

      {/* CONTENT */}
      <div className="space-y-1.5 p-2">
        {/* TITLE */}
        <div className="line-clamp-2 text-[9px] font-black leading-3 text-white sm:text-[11px] sm:leading-4">{link.title}</div>

        {/* URL */}
        <div className="line-clamp-1 text-[7px] text-slate-500 sm:text-[9px]">{link.url}</div>

        {/* LABEL */}
        <div className="flex min-h-3 flex-wrap gap-1">
          {labels.length > 0 ? (
            labels.slice(0, 1).map((label, i) => (
              <span key={`${label}-${i}`} className="rounded-full border border-cyan-300/15 bg-cyan-400/10 px-1 py-[2px] text-[6px] text-cyan-100 sm:text-[8px]">
                {label}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-white/10 bg-white/5 px-1 py-[2px] text-[6px] text-slate-400 sm:text-[8px]">—</span>
          )}
        </div>

        {/* ACTION */}
        <div className="flex items-center gap-1">
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-6 flex-1 items-center justify-center rounded-md border border-cyan-300/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15">
            <ExternalLink size={10} />
          </a>

          <button onClick={() => onCopy(link.url)} className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
            <Copy size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ListRow({ link, onCopy }: { link: SavedLink; onCopy: (url: string) => void }) {
  const labels = link.label
    ? link.label
        .split(",")
        .map((label) => label.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="flex flex-col gap-2 rounded-[0.95rem] border border-white/10 bg-[#07111f]/70 p-2.5 transition hover:border-cyan-300/15 hover:bg-white/[0.06] sm:rounded-[1.2rem] sm:p-3">
      <div className="min-w-0">
        <div className="line-clamp-2 text-[10px] font-black leading-4 text-white sm:text-xs">{link.title}</div>
        <div className="mt-0.5 line-clamp-1 text-[8px] text-slate-500 sm:text-[10px]">{link.url}</div>

        <div className="mt-2 flex min-h-4 flex-wrap gap-1">
          {labels.length > 0 ? (
            labels.slice(0, 2).map((label, index) => (
              <span key={`${label}-${index}`} className="rounded-full border border-cyan-300/15 bg-cyan-400/10 px-1.5 py-0.5 text-[7px] text-cyan-100 sm:text-[9px]">
                {label}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[7px] text-slate-400 sm:text-[9px]">No label</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-7 flex-1 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15 sm:h-8">
          <ExternalLink size={12} />
        </a>

        <button onClick={() => onCopy(link.url)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 sm:h-8 sm:w-8">
          <Copy size={12} />
        </button>
      </div>
    </div>
  );
}
