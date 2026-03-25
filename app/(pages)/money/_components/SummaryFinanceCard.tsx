import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { SummaryFinanceCardProps } from "../_types";

export function SummaryFinanceCard({ title, value, badge, icon, iconTone, badgeTone, trend }: SummaryFinanceCardProps) {
  return (
    <Card className="flex h-full flex-col justify-between rounded-[0.7rem] border border-border bg-card/80 p-2 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:rounded-3xl sm:p-4">
      <div>
        <div className="flex items-center justify-between">
          <div className={`flex h-5 w-5 items-center justify-center rounded-md sm:h-10 sm:w-10 sm:rounded-2xl ${iconTone}`}>{icon}</div>

          <Badge className={`hidden rounded-full border border-border bg-muted px-1.5 py-0 text-[7px] leading-loose dark:border-white/10 dark:bg-white/10 dark:text-slate-200 sm:inline-flex sm:px-1.5 sm:text-xs ${badgeTone ?? ""}`}>
            {badge}
          </Badge>
        </div>

        <div className="mt-1 text-[8px] leading-tight text-muted-foreground sm:mt-3 sm:text-sm">{title}</div>
        <div className="text-[10px] font-black leading-none text-foreground dark:text-white sm:text-2xl">{value}</div>
      </div>

      {trend && (
        <div className={`mt-0.5 flex items-center gap-0.5 text-[7px] font-medium sm:mt-2 sm:text-xs truncate ${trend.direction === "neutral" ? "text-slate-500 dark:text-slate-400 text-opacity-80" : trend.isPositive ? "text-emerald-500" : "text-rose-500"}`}>
          {trend.direction === "up" && <ArrowUp className="h-2 w-2 shrink-0 sm:h-3 sm:w-3" />}
          {trend.direction === "down" && <ArrowDown className="h-2 w-2 shrink-0 sm:h-3 sm:w-3" />}
          {trend.direction === "neutral" && <Minus className="h-2 w-2 shrink-0 sm:h-3 sm:w-3" />}
          <span className="truncate leading-tight">{trend.value}</span>
        </div>
      )}
    </Card>
  );
}
