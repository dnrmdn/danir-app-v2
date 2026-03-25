import { SavedLink } from "../_types";

import Image from "next/image";
import { getThumbnailUrl } from "@/lib/link-utils";
import { ExternalLink, Copy } from "lucide-react";

export function LinkCard({ link, onCopy, noLabelText }: { link: SavedLink; onCopy: (url: string) => void; noLabelText: string }) {
  const labels = link.label
    ? link.label
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="min-w-0 overflow-hidden rounded-[0.85rem] border border-border bg-muted/30 transition hover:border-cyan-300/15 hover:bg-muted/50 dark:border-white/10 dark:bg-[#07111f]/70 dark:hover:bg-white/6 sm:rounded-[1.1rem]">
      <div className="relative h-16 w-full sm:h-20">
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

      <div className="space-y-1.5 p-2">
        <div className="line-clamp-2 text-[9px] font-black leading-3 text-foreground dark:text-white sm:text-[11px] sm:leading-4">{link.title}</div>
        <div className="line-clamp-1 text-[7px] text-muted-foreground dark:text-slate-500 sm:text-[9px]">{link.url}</div>

        <div className="flex min-h-3 flex-wrap gap-1">
          {labels.length > 0 ? (
            labels.slice(0, 1).map((label, i) => (
              <span key={`${label}-${i}`} className="rounded-full border border-cyan-300/15 bg-cyan-400/10 px-1 py-0.5 text-[6px] text-cyan-700 dark:text-cyan-100 sm:text-[8px]">
                {label}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-border bg-muted/50 px-1 py-0.5 text-[6px] text-muted-foreground dark:border-white/10 dark:bg-white/5 dark:text-slate-400 sm:text-[8px]">{noLabelText}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-6 flex-1 items-center justify-center rounded-md border border-cyan-300/20 bg-cyan-400/10 text-cyan-700 hover:bg-cyan-400/15 dark:text-cyan-100">
            <ExternalLink size={10} />
          </a>

          <button
            onClick={() => onCopy(link.url)}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground hover:bg-muted dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <Copy size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}
