import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Landmark, PiggyBank, Plus, Save, WalletCards, Target, Coins, CircleDollarSign, AlertCircle, CheckCircle2, Info, Trash2 } from "lucide-react";
import { differenceInDays, differenceInMonths, isValid } from "date-fns";
import type { FinanceGoal, GoalsViewText, MoneyNavId } from "../_types";
import { formatCompactNumber, formatMoney, toNumber } from "../_lib/utils";
import { SummaryFinanceCard } from "./SummaryFinanceCard";

type GoalsViewProps = {
  t: GoalsViewText;
  goals: FinanceGoal[];
  setGoalDialogOpen: (open: boolean) => void;
  setGoalContributeDialogOpen: (open: boolean) => void;
  deleteGoal: (id: number) => void;
  setActive: (tab: MoneyNavId) => void;
};

function formatGoalMoney(amount: number, currency: string) {
  if (amount >= 1_000_000_000) {
    return `${currency === "IDR" ? "Rp " : `${currency} `}${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  return formatMoney(amount, currency);
}

function getProgressColor(progress: number) {
  if (progress < 50) return "bg-rose-500";
  if (progress < 80) return "bg-amber-500";
  return "bg-emerald-500";
}

function getProgressTextColor(progress: number) {
  if (progress < 50) return "text-rose-500 dark:text-rose-400";
  if (progress < 80) return "text-amber-500 dark:text-amber-400";
  return "text-emerald-500 dark:text-emerald-400";
}

function getProgressToneColor(progress: number) {
  if (progress < 50) return "bg-rose-500/10 border-rose-500/20";
  if (progress < 80) return "bg-amber-500/10 border-amber-500/20";
  return "bg-emerald-500/10 border-emerald-500/20";
}

export function GoalsView({ t, goals, setGoalDialogOpen, setGoalContributeDialogOpen, deleteGoal, setActive }: GoalsViewProps) {
  return (
    <div className="space-y-4 text-foreground dark:text-white sm:space-y-6">
      <Card className="rounded-[1.25rem] border border-border bg-card/80 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:rounded-4xl sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-600 dark:text-cyan-100 sm:px-3 sm:text-[11px] sm:tracking-[0.2em]">
              <PiggyBank className="h-3.5 w-3.5" />
              {t.goals}
            </div>
            <h2 className="text-xl font-black tracking-tight text-foreground dark:text-white sm:text-3xl">{t.goals}</h2>
            <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">{t.goalsSnapshotDesc}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] text-foreground dark:border-white/10 dark:bg-white/10 dark:text-slate-200 sm:px-3 sm:text-xs">
              {goals.length} {t.activeGoals}
            </Badge>
            <Button className="h-9 rounded-xl px-3 text-xs font-semibold sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={() => setGoalDialogOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4 sm:mr-2" />
              {t.newGoal}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
        <SummaryFinanceCard title={t.goals} value={String(goals.length)} badge="All" icon={<PiggyBank className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-200 sm:h-5 sm:w-5" />} iconTone="bg-emerald-400/10" />

        <SummaryFinanceCard
          title={t.target}
          value={formatGoalMoney(goals.reduce((sum, goal) => sum + toNumber(goal.targetAmount), 0), "IDR")}
          badge={t.aim}
          icon={<Landmark className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-200 sm:h-5 sm:w-5" />}
          iconTone="bg-cyan-400/10"
          badgeTone="border-cyan-300/15 bg-cyan-400/10 text-cyan-600 dark:text-cyan-100"
        />

        <SummaryFinanceCard
          title={t.saved_short}
          value={formatGoalMoney(goals.reduce((sum, goal) => sum + toNumber(goal.currentAmount), 0), "IDR")}
          badge={t.now}
          icon={<WalletCards className="h-3.5 w-3.5 text-violet-600 dark:text-violet-200 sm:h-5 sm:w-5" />}
          iconTone="bg-violet-400/10"
          badgeTone="border-violet-300/15 bg-violet-400/10 text-violet-600 dark:text-violet-100"
        />

        <SummaryFinanceCard
          title="Avg progress"
          value={`${
            goals.length
              ? Math.round(
                  goals.reduce((sum, goal) => {
                    const target = toNumber(goal.targetAmount);
                    const current = toNumber(goal.currentAmount);
                    return sum + (target > 0 ? (current / target) * 100 : 0);
                  }, 0) / goals.length,
                )
              : 0
          }%`}
          badge={t.rate}
          icon={<Save className="h-3.5 w-3.5 text-amber-600 dark:text-amber-200 sm:h-5 sm:w-5" />}
          iconTone="bg-amber-400/10"
          badgeTone="border-amber-300/15 bg-amber-400/10 text-amber-600 dark:text-amber-100"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[1.25rem] border border-border bg-card/80 p-3 text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white sm:rounded-4xl sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
            <div>
              <div className="text-base font-black sm:text-lg">{t.goalProgressBoard}</div>
              <div className="text-xs text-muted-foreground sm:text-sm">{t.goalBoardDesc}</div>
            </div>
            <PiggyBank className="h-4 w-4 text-cyan-600 dark:text-cyan-200 sm:h-5 sm:w-5" />
          </div>

          <div className="space-y-3 sm:space-y-4">
            {goals.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-border bg-muted/30 dark:border-white/10 dark:bg-white/5 sm:p-12">
                <Target className="h-12 w-12 text-cyan-500/50 mb-4 sm:h-16 sm:w-16" />
                <h3 className="text-base font-bold text-foreground dark:text-white sm:text-lg">{t.startFirstGoal}</h3>
                <p className="mt-2 text-xs text-muted-foreground sm:text-sm max-w-xs">{t.firstGoalDesc}</p>
                <Button className="mt-6 h-10 rounded-xl px-4 text-xs font-semibold sm:h-11 sm:rounded-2xl sm:px-6 sm:text-sm" onClick={() => setGoalDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t.createGoalNow}
                </Button>
              </div>
            ) : (
              goals.map((g) => {
                const current = toNumber(g.currentAmount);
                const target = toNumber(g.targetAmount);
                const progress = target === 0 ? 0 : (current / target) * 100;
                const roundedProgress = Math.min(progress, 100);
                
                let daysLeft: number | null = null;
                let monthlySaving: number | null = null;
                if (g.targetDate) {
                  const targetDateStr = new Date(g.targetDate);
                  if (isValid(targetDateStr)) {
                    const diffDays = differenceInDays(targetDateStr, new Date());
                    daysLeft = diffDays > 0 ? diffDays : 0;
                    
                    let diffMonths = differenceInMonths(targetDateStr, new Date());
                    if (diffMonths <= 0) diffMonths = 1;
                    monthlySaving = Math.max(target - current, 0) / diffMonths;
                  }
                }

                const progressColor = getProgressColor(roundedProgress);
                const textColor = getProgressTextColor(roundedProgress);
                const toneColor = getProgressToneColor(roundedProgress);

                return (
                  <div key={g.id} className="rounded-2xl border border-border bg-card shadow-sm p-4 dark:border-white/10 dark:bg-[#07111f]/70 sm:rounded-3xl sm:p-5 transition-shadow hover:shadow-md">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 sm:p-3 rounded-xl border ${toneColor}`}>
                          <Target className={`h-5 w-5 sm:h-6 sm:w-6 ${textColor}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-black text-foreground dark:text-white sm:text-base md:text-lg">{g.name}</div>
                          <div className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                            {formatGoalMoney(current, g.currency)} / {formatGoalMoney(target, g.currency)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-start gap-2">
                        <div className={`pt-1 text-base sm:text-xl font-black ${textColor}`}>
                          {roundedProgress.toFixed(0)}%
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500/70 hover:bg-rose-500/10 hover:text-rose-600 sm:h-9 sm:w-9"
                          onClick={() => deleteGoal(g.id)}
                          title={t.deleteGoal}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="h-2.5 sm:h-3 w-full overflow-hidden rounded-full bg-muted dark:bg-white/5 border border-border/50 dark:border-white/5">
                      <div className={`h-full rounded-full ${progressColor} transition-all duration-500 ease-in-out`} style={{ width: `${roundedProgress}%` }} />
                    </div>

                    {(daysLeft !== null || monthlySaving !== null) && (
                      <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-2 gap-3 sm:gap-4">
                        {daysLeft !== null && (
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </div>
                            <div>
                              <div className="text-[9px] uppercase tracking-wider text-muted-foreground sm:text-[10px]">{t.remainingDays}</div>
                              <div className="text-xs font-semibold text-foreground dark:text-white sm:text-sm">⏳ {daysLeft} {t.days}</div>
                            </div>
                          </div>
                        )}
                        {monthlySaving !== null && (
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                              <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </div>
                            <div>
                              <div className="text-[9px] uppercase tracking-wider text-muted-foreground sm:text-[10px]">{t.savePerMonth}</div>
                              <div className="text-xs font-semibold text-foreground dark:text-white sm:text-sm">{formatGoalMoney(monthlySaving, g.currency)}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <div className="space-y-4 sm:space-y-6">
          <Card className="rounded-[1.25rem] border border-border bg-card/80 p-3 text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white sm:rounded-4xl sm:p-6">
            <div className="mb-3 flex items-center justify-between sm:mb-4">
              <div>
                <div className="text-base font-black sm:text-lg">{t.goalInsights}</div>
                <div className="text-xs text-muted-foreground sm:text-sm">{t.goalInsightsDesc}</div>
              </div>
              <Save className="h-4 w-4 text-amber-600 dark:text-amber-200 sm:h-5 sm:w-5" />
            </div>

            <div className="space-y-3">
              {goals.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground dark:border-white/10 dark:bg-[#07111f]/50 sm:rounded-2xl sm:p-4 sm:text-sm">{t.noGoalInsights}</div>
              ) : (
                goals.map((g) => {
                  const current = toNumber(g.currentAmount);
                  const target = toNumber(g.targetAmount);
                  const progress = target === 0 ? 0 : (current / target) * 100;
                  
                  let insightStatus = "neutral";
                  let insightText = t.insightNoDeadline;
                  
                  if (g.targetDate && g.createdAt) {
                    const targetDate = new Date(g.targetDate);
                    const createdAt = new Date(g.createdAt);
                    const now = new Date();
                    
                    if (isValid(targetDate) && isValid(createdAt)) {
                      const totalDuration = targetDate.getTime() - createdAt.getTime();
                      const elapsedDuration = now.getTime() - createdAt.getTime();
                      
                      let expectedProgress = 0;
                      if (totalDuration > 0) {
                        expectedProgress = (elapsedDuration / totalDuration) * 100;
                      }
                      
                      if (progress >= 100) {
                        insightStatus = "ahead";
                        insightText = t.insightDone;
                      } else if (elapsedDuration < 0) {
                        insightStatus = "neutral";
                        insightText = t.insightNotStarted;
                      } else if (progress >= expectedProgress) {
                        insightStatus = "ahead";
                        insightText = t.insightAhead;
                      } else if (progress < expectedProgress) {
                        insightStatus = "behind";
                        const expectedAmount = (expectedProgress / 100) * target;
                        const behindBy = expectedAmount - current;
                        insightText = t.insightBehindAmount(formatGoalMoney(behindBy, g.currency));
                      } else {
                        insightStatus = "ontrack";
                        insightText = t.insightOnTrack;
                      }
                    }
                  } else if (progress >= 100) {
                     insightStatus = "ahead";
                     insightText = t.insightDone;
                  } else if (progress > 0) {
                     insightStatus = "ontrack";
                     insightText = t.insightOnTrackNoDate;
                  }

                  let IconClass = Info;
                  let toneClass = "bg-muted/50 border-border text-foreground dark:bg-white/5 dark:border-white/5";
                  
                  if (insightStatus === "ahead" || insightStatus === "ontrack") {
                    IconClass = CheckCircle2;
                    toneClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300";
                  } else if (insightStatus === "behind") {
                    IconClass = AlertCircle;
                    toneClass = "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300";
                  }

                  return (
                    <div key={g.id} className={`rounded-xl border p-3 sm:rounded-2xl sm:p-4 flex gap-3 items-start ${toneClass}`}>
                      <IconClass className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider opacity-80 sm:text-xs mb-1">{g.name}</div>
                        <div className="text-xs font-medium sm:text-sm">{insightText}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          <Card className="rounded-[1.25rem] border border-border bg-card/80 p-3 text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white sm:rounded-4xl sm:p-6">
            <div className="mb-3 flex items-center justify-between sm:mb-4">
              <div>
                <div className="text-base font-black sm:text-lg">{t.quickActions}</div>
                <div className="text-xs text-muted-foreground sm:text-sm">{t.quickActionsGoalDesc}</div>
              </div>
              <Plus className="h-4 w-4 text-cyan-600 dark:text-cyan-200 sm:h-5 sm:w-5" />
            </div>

            <div className="grid gap-2.5 sm:gap-3">
              <Button className="h-10 justify-start rounded-xl px-3 text-xs font-semibold sm:h-11 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={() => setGoalDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t.newGoal}
              </Button>

              <Button
                variant="outline"
                className="h-10 justify-start rounded-xl border border-border bg-card/50 px-3 text-xs text-foreground hover:bg-accent dark:border-white/10 dark:bg-[#07111f]/80 dark:text-slate-100 dark:hover:bg-white/10 sm:h-11 sm:rounded-2xl sm:px-4 sm:text-sm"
                onClick={() => setGoalContributeDialogOpen(true)}
              >
                <CircleDollarSign className="mr-2 h-4 w-4" />
                {t.addContribution}
              </Button>

              <Button
                variant="outline"
                className="h-10 justify-start rounded-xl border border-border bg-card/50 px-3 text-xs text-foreground hover:bg-accent dark:border-white/10 dark:bg-[#07111f]/80 dark:text-slate-100 dark:hover:bg-white/10 sm:h-11 sm:rounded-2xl sm:px-4 sm:text-sm"
                onClick={() => setActive("dashboard")}
              >
                <WalletCards className="mr-2 h-4 w-4" />
                {t.backToDashboard}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
