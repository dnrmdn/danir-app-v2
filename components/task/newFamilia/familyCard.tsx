"use client";

import { Card } from "@/components/ui/card";
import HeaderCard from "./headerCard";
import TaskCard from "./taskCard";
import { useMemberStore } from "@/lib/store/member-store";
import { useEffect } from "react";

export default function FamilyCard() {

  const { members, isLoading, fetchMembers } = useMemberStore()

  // Ambil data saat component mount
  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  // Jika loading
  if (isLoading) {
    return <div className="p-4"> Loading members...</div>
  }

  // Jika kosong
  if (!members || members.length === 0) {
    return <div className="p-4">No member provided</div>;
  }

  return (
    <div className="overflow-hidden">
      <div className="flex gap-6 p-4 scroll-smooth">
        {members.map((person) => (
          <Card
            key={person.id}
            className={`flex flex-col rounded-3xl ${person.bgColor} transition-all duration-300`}
            style={{
              height: "90vh",
              flex: "0 0 auto",
              width: "calc(100% / 1.1)",
              maxWidth: "400px",
            }}
          >
            <HeaderCard member={person} />
            <div className="px-4 overflow-y-auto h-full rounded-[40px] space-y-4 no-scrollbar">
              {person.tasks.map((task, i) => (
                <TaskCard key={`${person.id}-${task.label}-${i}`} task={task} member={person} />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
