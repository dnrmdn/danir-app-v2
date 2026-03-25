import { Copy, ExternalLink } from "lucide-react";
import { SavedLink } from "../_types";

export function ListRow({ link, onCopy, noLabelText }: { link: SavedLink; onCopy: (url: string) => void; noLabelText: string }) {
  const labels = link.label
    ? link.label
        .split(",")
        .map((label) => label.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="flex flex-col gap-2 rounded-[0.95rem] border border-border bg-muted/30 p-2.5 transition hover:border-cyan-300/15 hover:bg-muted/50 dark:border-white/10 dark:bg-[#07111f]/70 dark:hover:bg-white/6 sm:rounded-[1.2rem] sm:p-3">
      <div className="min-w-0">
        <div className="line-clamp-2 text-[10px] font-black leading-4 text-foreground dark:text-white sm:text-xs">{link.title}</div>
        <div className="mt-0.5 line-clamp-1 text-[8px] text-muted-foreground dark:text-slate-500 sm:text-[10px]">{link.url}</div>

        <div className="mt-2 flex min-h-4 flex-wrap gap-1">
          {labels.length > 0 ? (
            labels.slice(0, 2).map((label, index) => (
              <span key={`${label}-${index}`} className="rounded-full border border-cyan-300/15 bg-cyan-400/10 px-1.5 py-0.5 text-[7px] text-cyan-700 dark:text-cyan-100 sm:text-[9px]">
                {label}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-border bg-muted/50 px-1.5 py-0.5 text-[7px] text-muted-foreground dark:border-white/10 dark:bg-white/5 dark:text-slate-400 sm:text-[9px]">{noLabelText}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-7 flex-1 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-400/10 text-cyan-700 hover:bg-cyan-400/15 dark:text-cyan-100 sm:h-8"
        >
          <ExternalLink size={12} />
        </a>

        <button
          onClick={() => onCopy(link.url)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-muted/50 text-muted-foreground hover:bg-muted dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 sm:h-8 sm:w-8"
        >
          <Copy size={12} />
        </button>
      </div>
    </div>
  );
}
