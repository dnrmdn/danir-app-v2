"use client"

import { CheckCircle2, Circle } from "lucide-react"
import { useState } from "react"

const tasks = [
  { id: 1, title: "Complete project proposal", priority: "high", completed: false },
  { id: 2, title: "Review team feedback", priority: "medium", completed: true },
  { id: 3, title: "Schedule client meeting", priority: "high", completed: false },
  { id: 4, title: "Update documentation", priority: "low", completed: false },
]

export function TaskOverview() {
  const [taskList, setTaskList] = useState(tasks)
  const completedCount = taskList.filter((t) => t.completed).length

  const toggleTask = (id: number) => {
    setTaskList(taskList.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-card-foreground mb-2">Task Overview</h3>
        <p className="text-sm text-muted-foreground">Quickly check your daily tasks, progress, and priorities.</p>
        <div className="mt-4 text-sm">
          <span className="font-medium text-foreground">
            {completedCount} of {taskList.length}
          </span>
          <span className="text-muted-foreground"> tasks completed</span>
        </div>
      </div>

      <div className="space-y-3">
        {taskList.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            onClick={() => toggleTask(task.id)}
          >
            {task.completed ? (
              <CheckCircle2 className="text-accent flex-shrink-0" size={20} />
            ) : (
              <Circle className="text-muted-foreground flex-shrink-0" size={20} />
            )}
            <span
              className={`flex-1 text-sm ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
            >
              {task.title}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                task.priority === "high"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  : task.priority === "medium"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
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
