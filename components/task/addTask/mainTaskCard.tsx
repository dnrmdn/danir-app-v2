"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/lib/store/task-store";
import TaskCard from "../taskCard/taskCard";
import HorizontalCards from "../../shared/horizontalCard";
import HeaderTask from "../taskCard/headerTask";
import { useLanguage } from "@/components/language-provider";

const contentCards = {
  id: { empty: "Belum ada task untuk member ini" },
  en: { empty: "No tasks for this member yet" }
};

export default function MainTaskCard() {
  const { locale } = useLanguage();
  const t = contentCards[locale];
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
                <div className="flex min-h-[220px] items-center justify-center rounded-[1.75rem] border border-dashed border-border bg-muted/50 text-center text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5 dark:text-slate-500">
                  {t.empty}
                </div>
              );
            })()}
          </div>
        </>
      )}
    </HorizontalCards>
  );
}
