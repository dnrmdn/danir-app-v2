"use client";

import { Card } from "@/components/ui/card";
import { useMemberStore } from "@/lib/store/member-store";
import { useEffect } from "react";
import HeaderCard from "../newFamilia/headerCard";
import TaskCard from "../newFamilia/taskCard";

export default function MemberItem() {
  const { members, isLoading, fetchMembers } = useMemberStore();

  // Ambil data saat component mount
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Jika loading
  if (isLoading) {
    return <div className="p-4"> Loading members...</div>;
  }

  // Jika kosong
  if (!members || members.length === 0) {
    return <div className="p-4">No member provided</div>;
  }

  return (
    <div className="overflow-hidden">
      <div className="flex gap-6 p-4 scroll-smooth">
        {members.map((member) => (
          <Card
            key={member.id}
            className={`flex flex-col rounded-3xl ${member.bgColor} transition-all duration-300`}
            style={{
              height: "90vh",
              flex: "0 0 auto",
              width: "calc(100% / 1.1)",
              maxWidth: "400px",
            }}
          >
            <HeaderCard member={member} />
            <div className="px-4 overflow-y-auto h-full rounded-[40px] space-y-4 no-scrollbar">
              {member.tasks.map((task, i) => (
                <TaskCard key={`${member.id}-${task.label}-${i}`} task={task} member={member} />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
