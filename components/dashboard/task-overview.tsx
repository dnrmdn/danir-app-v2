"use client"

import { CheckCircle2, Circle, Sparkles } from "lucide-react"
import { useState } from "react"

const tasks = [
  { id: 1, title: "Finalize landing redesign", priority: "high", completed: false },
  { id: 2, title: "Review money tracker flow", priority: "medium", completed: true },
  { id: 3, title: "Plan meals for the week", priority: "medium", completed: false },
  { id: 4, title: "Clean saved links labels", priority: "low", completed: false },
]

export function TaskOverview() {
  const [taskList, setTaskList] = useState(tasks)
  const completedCount = taskList.filter((t) => t.completed).length

  const toggleTask = (id: number) => {
    setTaskList(taskList.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-950/10 backdrop-blur-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Daily Focus
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Task Overview</h3>
          <p className="text-sm text-slate-300">Track priorities, progress, and what needs attention next.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-right">
          <div className="text-2xl font-bold text-white">{completedCount}/{taskList.length}</div>
          <div className="text-xs text-slate-400">tasks done</div>
        </div>
      </div>

      <div className="space-y-3">
        {taskList.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4 transition hover:border-cyan-400/30 hover:bg-white/5 cursor-pointer"
            onClick={() => toggleTask(task.id)}
          >
            {task.completed ? (
              <CheckCircle2 className="text-emerald-300 flex-shrink-0" size={20} />
            ) : (
              <Circle className="text-slate-500 flex-shrink-0" size={20} />
            )}
            <span className={`flex-1 text-sm ${task.completed ? "line-through text-slate-500" : "text-slate-100"}`}>
              {task.title}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                task.priority === "high"
                  ? "bg-red-500/15 text-red-300"
                  : task.priority === "medium"
                    ? "bg-amber-500/15 text-amber-300"
                    : "bg-emerald-500/15 text-emerald-300"
              }`}
            >
              {task.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
