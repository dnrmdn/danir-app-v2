import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileUp, RefreshCcw } from "lucide-react";

type MoneyPageHeaderProps = {
  t: {
    title: string;
    subtitle: string;
    desc: string;
    monthLabel: string;
    refresh: string;
    exportCsv: string;
    importCsv: string;
  };
  month: string;
  setMonth: (month: string) => void;
  reloadMonthData: () => void;
  loading: boolean;
  exportUrl: string;
  handleImportClick: () => void;
  importInputRef: React.RefObject<HTMLInputElement | null>;
  handleImportFile: (file: File | null) => void;
};

export function MoneyPageHeader({ t, month, setMonth, reloadMonthData, loading, exportUrl, handleImportClick, importInputRef, handleImportFile }: MoneyPageHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary sm:text-sm">{t.title}</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-4xl lg:text-5xl">{t.subtitle}</h1>
        <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">{t.desc}</p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <div className="flex items-center gap-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground sm:text-xs sm:tracking-widest">{t.monthLabel}</Label>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-9 w-[136px] rounded-xl border-border text-xs sm:h-10 sm:w-40 sm:rounded-2xl sm:text-sm" />
        </div>

        <Button
          variant="outline"
          className="h-9 rounded-xl border border-border bg-card/80 px-3 text-xs text-foreground hover:bg-accent dark:border-white/10 dark:bg-[#07111f]/80 dark:text-slate-100 dark:hover:bg-white/10 dark:hover:text-white sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm"
          onClick={() => reloadMonthData()}
          disabled={loading}
        >
          <RefreshCcw className="mr-1.5 h-4 w-4 sm:mr-2" />
          {t.refresh}
        </Button>

        <Button
          variant="outline"
          className="h-9 rounded-xl border border-border bg-card/80 px-3 text-xs text-foreground hover:bg-accent dark:border-white/10 dark:bg-[#07111f]/80 dark:text-slate-100 dark:hover:bg-white/10 dark:hover:text-white sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm"
          asChild
        >
          <a href={exportUrl}>
            <Download className="mr-1.5 h-4 w-4 sm:mr-2" />
            {t.exportCsv}
          </a>
        </Button>

        <Button
          variant="outline"
          className="h-9 rounded-xl border border-border bg-card/80 px-3 text-xs text-foreground hover:bg-accent dark:border-white/10 dark:bg-[#07111f]/80 dark:text-slate-100 dark:hover:bg-white/10 dark:hover:text-white sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm"
          onClick={handleImportClick}
          disabled={loading}
        >
          <FileUp className="mr-1.5 h-4 w-4 sm:mr-2" />
          {t.importCsv}
        </Button>

        <input ref={importInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => handleImportFile(e.target.files?.[0] || null)} />
      </div>
    </div>
  );
}
