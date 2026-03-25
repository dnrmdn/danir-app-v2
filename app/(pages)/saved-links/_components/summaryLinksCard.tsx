import { Card } from "@/components/ui/card";

export function SummaryCard({ title, value, subtitle, icon }: { title: string; value: string; subtitle: string; icon: React.ReactNode }) {
  return (
    <Card className="max-w-none! min-h-[32px] sm:min-h-[120px] rounded-[0.75rem] border border-border bg-card px-1 py-1 text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white sm:rounded-[1.5rem] sm:p-4">
      {/* ICON */}
      <div className="mb-0.5 flex items-center justify-between sm:mb-3">
        <div className="rounded-md border border-border bg-muted/50 p-[2px] dark:border-white/10 dark:bg-white/5 sm:rounded-xl sm:p-2">{icon}</div>
      </div>

      {/* VALUE */}
      <div className="truncate text-[9px] font-black leading-none text-foreground dark:text-white sm:text-2xl">{value}</div>

      {/* TITLE */}
      <div className="mt-[2px] text-[6px] font-semibold leading-tight text-muted-foreground dark:text-slate-200 sm:mt-1 sm:text-xs">{title}</div>

      {/* SUBTITLE */}
      <div className="mt-[1px] line-clamp-1 text-[5.5px] leading-tight text-muted-foreground dark:text-slate-500 sm:mt-0.5 sm:text-[11px]">{subtitle}</div>
    </Card>
  );
}
