import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FinanceBudgetRow } from "../_types";
import { formatMoney, toNumber } from "../_lib/utils";

type BudgetsViewProps = {
  t: {
    budgets: string;
    budgetDescLong: string;
    setBudget: string;
    noBudgets: string;
  };
  budgets: FinanceBudgetRow[];
  setBudgetDialogOpen: (open: boolean) => void;
};

export function BudgetsView({ t, budgets, setBudgetDialogOpen }: BudgetsViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 xl:gap-6 pb-20">
      {budgets.length === 0 ? (
        <div className="text-xs text-muted-foreground sm:text-sm col-span-full text-center py-10 border border-dashed rounded-2xl dark:border-white/10">{t.noBudgets}</div>
      ) : (
        budgets.map((b) => {
          const spent = toNumber(b.spent);
          const limit = toNumber(b.limit);
          const progress = limit === 0 ? 0 : (spent / limit) * 100;
          const isOver = spent > limit;
          return (
            <div key={b.id} className={`rounded-xl border p-3 sm:rounded-2xl sm:p-5 flex flex-col justify-between h-full ${isOver ? "border-rose-500/20 bg-rose-500/10" : "border-border bg-card/80 dark:border-white/5 dark:bg-white/5 backdrop-blur-xl"}`}>
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="text-sm font-black sm:text-base text-foreground dark:text-white truncate pr-2">{b.category.name}</div>
                  <Badge variant="secondary" className="rounded-lg border border-border bg-muted/60 text-[10px] dark:border-white/10 dark:bg-white/10 dark:text-slate-200 sm:text-xs">
                    {b.currency}
                  </Badge>
                </div>
                <div className="mt-2 text-xs font-semibold text-muted-foreground sm:text-sm">
                  {formatMoney(spent, b.currency)} <span className="opacity-50 font-normal ml-1">dari {formatMoney(limit, b.currency)}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1.5 text-[10px] sm:text-xs font-bold">
                  <span className={`${isOver ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>
                    {progress.toFixed(0)}%
                  </span>
                  {isOver && <span className="text-rose-600 dark:text-rose-400">Exceeded</span>}
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted dark:bg-black/40">
                  <div className={`${isOver ? "bg-rose-500" : "bg-emerald-500"} h-2 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
