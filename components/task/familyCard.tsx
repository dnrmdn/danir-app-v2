"use client";

import { Card } from "@/components/ui/card";
import HeaderCard from "./headerCard";
import { useMemberStore } from "@/lib/store/member-store";
import { useTaskStore } from "@/lib/store/task-store";
import { useEffect, useRef } from "react";
import TaskCard from "./taskCard/taskCard";

export default function FamilyCard() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { members, isLoading, fetchMembers } = useMemberStore();
  const tasks = useTaskStore((s) => s.tasks);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);

  useEffect(() => {
    fetchMembers();
    fetchTasks();
  }, [fetchMembers, fetchTasks]);

  if (isLoading) return <div className="p-4">Loading members...</div>;
  if (!members || members.length === 0) return <div className="p-4">No member provided</div>;

  return (
    <div className="relative">
      <div ref={containerRef} tabIndex={0} className="overflow-x-auto pb-2 scroll-smooth hide-scrollbar snap-x snap-mandatory" style={{ scrollBehavior: "smooth" }}>
        <div className="flex gap-6 py-4 flex-nowrap">
          {members.map((person) => (
            <Card
              key={person.id}
              className={`flex flex-col rounded-3xl ${person.bgColor} transition-all duration-300 snap-start`}
              style={{
                height: "90vh",
                flex: "0 0 auto",
                width: "calc(100% / 1.1)",
                maxWidth: "400px",
              }}
            >
              <HeaderCard member={person} />
              <div className="px-4 overflow-y-auto h-full rounded-[40px] space-y-4 no-scrollbar">
                {tasks
                  .filter((t) => t.memberId === person.id)
                  .map((task) => (
                    <TaskCard key={task.id} task={task} member={person}/>
                    // <TaskCard key={task.id} task={task} member={person} />
                  ))}
              </div>
            </Card>
          ))}

          {/* Spacer agar tidak mentok */}
          <div className="shrink-0 w-4 sm:w-10"></div>
        </div>
      </div>
    </div>
  );
}
