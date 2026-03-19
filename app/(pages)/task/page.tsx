"use client";

import { useEffect, useMemo } from "react";
import { CheckCircle2, Clock3, ListTodo, Sparkles, Star } from "lucide-react";
import AddButtonTask from "@/components/task/addTask/addButtonTask";
import MainTaskCard from "@/components/task/addTask/mainTaskCard";
import { useTaskStore } from "@/lib/store/task-store";
import { useMemberStore } from "@/lib/store/member-store";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/components/language-provider";

const contentLocal = {
  id: {
    badge: "Task v2",
    title: "Ubah tugas jadi progres nyata.",
    desc: "Fokus buat hari ini, cek yang udah kelar, dan lihat kumpulan progres dari setiap tugas barumu.",
    totalTitle: "Total tugas",
    totalSub: "Semua tugas antar member",
    completedTitle: "Selesai",
    completedSub: "Tugas yang sudah kelar dikerjakan",
    pendingTitle: "Belum lunas",
    pendingSub: "Masih nunggu buat dikerjakan",
    rewardTitle: "Poin hadiah",
    rewardSub: (rate: number, mem: number) => `${rate}% rasio selesai • ${mem} member`,
    boardTitle: "Papan tugas per member",
    boardDesc: "Geser ke samping buat fokus tiap satu member."
  },
  en: {
    badge: "Task v2",
    title: "Turn tasks into clear momentum.",
    desc: "Keep today focused, see what is completed, and connect every finished task to visible reward progress.",
    totalTitle: "Total tasks",
    totalSub: "All tasks across members",
    completedTitle: "Completed",
    completedSub: "Finished tasks already done",
    pendingTitle: "Pending",
    pendingSub: "Still waiting for action",
    rewardTitle: "Reward points",
    rewardSub: (rate: number, mem: number) => `${rate}% completion rate • ${mem} member(s)`,
    boardTitle: "Task board by member",
    boardDesc: "Swipe or scroll horizontally to focus on one member at a time."
  }
};

export default function TaskPage() {
  const { locale } = useLanguage();
  const t = contentLocal[locale];

  const tasks = useTaskStore((s) => s.tasks);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);
  const members = useMemberStore((s) => s.members);
  const fetchMembers = useMemberStore((s) => s.fetchMembers);

  useEffect(() => {
    fetchTasks();
    fetchMembers();
  }, [fetchTasks, fetchMembers]);

  const completed = useMemo(() => tasks.filter((task) => task.completed).length, [tasks]);
  const pending = tasks.length - completed;
  const rewardPoints = useMemo(
    () => tasks.filter((task) => task.completed).reduce((sum, task) => sum + (task.reward || 0), 0),
    [tasks]
  );
  const completionRate = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  return (
    <div className="space-y-8 pb-8">
      <section className="rounded-[2rem] border border-border bg-card/80 p-6 text-foreground shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-2xl dark:shadow-cyan-950/10 backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-100/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              {t.badge}
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground dark:text-white sm:text-5xl">{t.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground dark:text-slate-300 sm:text-base">
              {t.desc}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-1 dark:border-cyan-300/20 dark:bg-cyan-400/10">
              <AddButtonTask />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title={t.totalTitle}
          value={String(tasks.length)}
          subtitle={t.totalSub}
          icon={<ListTodo className="h-5 w-5 text-cyan-600 dark:text-cyan-200" />}
        />
        <SummaryCard
          title={t.completedTitle}
          value={String(completed)}
          subtitle={t.completedSub}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-200" />}
        />
        <SummaryCard
          title={t.pendingTitle}
          value={String(pending)}
          subtitle={t.pendingSub}
          icon={<Clock3 className="h-5 w-5 text-amber-600 dark:text-amber-200" />}
        />
        <SummaryCard
          title={t.rewardTitle}
          value={String(rewardPoints)}
          subtitle={t.rewardSub(completionRate, members.length)}
          icon={<Star className="h-5 w-5 text-yellow-600 dark:text-yellow-200" />}
        />
      </section>

      <section>
        <Card className="!max-w-none w-full overflow-hidden rounded-[2rem] border border-border bg-card/80 p-4 text-foreground dark:border-white/10 dark:bg-white/5 dark:text-white backdrop-blur-xl sm:p-5">
          <div className="mb-4 flex items-center justify-between px-1">
            <div>
              <div className="text-xl font-black text-foreground dark:text-white">{t.boardTitle}</div>
              <div className="text-sm text-muted-foreground dark:text-slate-400">{t.boardDesc}</div>
            </div>
          </div>
          <MainTaskCard />
        </Card>
      </section>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="!max-w-none rounded-[1.75rem] border border-border bg-card/80 p-5 text-foreground dark:border-white/10 dark:bg-white/5 dark:text-white backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-2xl border border-border bg-muted/50 p-3 dark:border-white/10 dark:bg-white/5">{icon}</div>
      </div>
      <div className="text-3xl font-black text-foreground dark:text-white">{value}</div>
      <div className="mt-2 text-sm font-semibold text-foreground dark:text-slate-200">{title}</div>
      <div className="mt-1 text-xs leading-5 text-muted-foreground dark:text-slate-500">{subtitle}</div>
    </Card>
  );
}
