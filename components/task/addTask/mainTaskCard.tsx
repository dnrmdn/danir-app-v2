"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/lib/store/task-store";
import TaskCard from "../taskCard/taskCard";
import HorizontalCards from "../../shared/horizontalCard";
import HeaderTask from "../taskCard/headerTask";

export default function MainTaskCard() {
  const tasks = useTaskStore((s) => s.tasks);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <HorizontalCards>
      {(member) => (
        <>
          <HeaderTask member={member} />

          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 no-scrollbar">
            {(() => {
              const memberTasks = tasks.filter((t) => t.memberId === member.id);

              return memberTasks.length > 0 ? (
                memberTasks.map((task) => <TaskCard key={task.id} task={task} member={member} />)
              ) : (
                <div className="flex min-h-[220px] items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-white/5 text-center text-sm text-slate-500">
                  Belum ada task untuk member ini
                </div>
              );
            })()}
          </div>
        </>
      )}
    </HorizontalCards>
  );
}
