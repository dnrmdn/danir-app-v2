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

          <div className="px-4 overflow-y-auto h-full rounded-[40px] space-y-4 no-scrollbar">
            {(() => {
              const memberTasks = tasks.filter((t) => t.memberId === member.id);

              return memberTasks.length > 0 ? memberTasks.map((task) => <TaskCard key={task.id} task={task} member={member} />) : <p className="text-center text-gray-400 py-10">Belum ada task untuk member ini</p>;
            })()}
          </div>
        </>
      )}
    </HorizontalCards>
  );
}
