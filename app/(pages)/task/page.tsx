"use client";

import { useEffect, useMemo } from "react";
import { CheckCircle2, Clock3, ListTodo, Sparkles, Star } from "lucide-react";
import AddButtonTask from "@/components/task/addTask/addButtonTask";
import MainTaskCard from "@/components/task/addTask/mainTaskCard";
import { useTaskStore } from "@/lib/store/task-store";
import { useMemberStore } from "@/lib/store/member-store";
import { Card } from "@/components/ui/card";

export default function TaskPage() {
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
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-white shadow-2xl shadow-cyan-950/10 backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              Task v2
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Turn tasks into clear momentum.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Keep today focused, see what is completed, and connect every finished task to visible reward progress.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-1">
              <AddButtonTask />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total tasks"
          value={String(tasks.length)}
          subtitle="All tasks across members"
          icon={<ListTodo className="h-5 w-5 text-cyan-200" />}
        />
        <SummaryCard
          title="Completed"
          value={String(completed)}
          subtitle="Finished tasks already done"
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-200" />}
        />
        <SummaryCard
          title="Pending"
          value={String(pending)}
          subtitle="Still waiting for action"
          icon={<Clock3 className="h-5 w-5 text-amber-200" />}
        />
        <SummaryCard
          title="Reward points"
          value={String(rewardPoints)}
          subtitle={`${completionRate}% completion rate • ${members.length} member(s)`}
          icon={<Star className="h-5 w-5 text-yellow-200" />}
        />
      </section>

      <section>
        <Card className="!max-w-none w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-4 text-white backdrop-blur-xl sm:p-5">
          <div className="mb-4 flex items-center justify-between px-1">
            <div>
              <div className="text-xl font-black text-white">Task board by member</div>
              <div className="text-sm text-slate-400">Swipe or scroll horizontally to focus on one member at a time.</div>
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
    <Card className="!max-w-none rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-white backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">{icon}</div>
      </div>
      <div className="text-3xl font-black text-white">{value}</div>
      <div className="mt-2 text-sm font-semibold text-slate-200">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</div>
    </Card>
  );
}
