"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";

// Data dummy (sesuaikan jika kamu punya file data terpisah)
const tasks = [
  { id: 1, title: "Finalize landing redesign", priority: "high", completed: false },
  { id: 2, title: "Review money-tracker flow", priority: "medium", completed: false },
  { id: 3, title: "Plan meals for the week", priority: "medium", completed: false },
  { id: 4, title: "Clean saved links labels", priority: "low", completed: false },
];

export function TaskOverview() {
  const [taskList, setTaskList] = useState(tasks);
  const completedCount = taskList.filter((t) => t.completed).length;

  const toggleTask = (id: number) => {
    setTaskList(taskList.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  return (
    <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-xl shadow-cyan-950/5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:shadow-cyan-950/10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:border-cyan-400/20 dark:text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Daily Focus
          </div>
          <h3 className="mb-2 text-xl font-semibold text-foreground dark:text-white">Task Overview</h3>
          <p className="text-sm text-muted-foreground dark:text-slate-300">Track priorities, progress, and what needs attention next.</p>
        </div>

        <div className="rounded-2xl border border-border bg-muted/50 px-4 py-3 text-right dark:border-white/10 dark:bg-slate-950/60">
          <div className="text-2xl font-bold text-foreground dark:text-white">
            {completedCount}/{taskList.length}
          </div>
          <div className="text-xs text-muted-foreground dark:text-slate-400">tasks done</div>
        </div>
      </div>

      <div className="space-y-3">
        {taskList.map((task) => (
          <div
            key={task.id}
            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-background p-4 transition hover:border-cyan-400/40 hover:bg-accent dark:border-white/10 dark:bg-slate-950/50 dark:hover:border-cyan-400/30 dark:hover:bg-white/5"
            onClick={() => toggleTask(task.id)}
          >
            {task.completed ? <CheckCircle2 className="flex-shrink-0 text-emerald-600 dark:text-emerald-300" size={20} /> : <Circle className="flex-shrink-0 text-slate-300 dark:text-slate-500" size={20} />}

            <span className={`flex-1 text-sm ${task.completed ? "line-through text-muted-foreground dark:text-slate-500" : "text-foreground dark:text-slate-100"}`}>{task.title}</span>

            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                task.priority === "high"
                  ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                  : task.priority === "medium"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
              }`}
            >
              {task.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
