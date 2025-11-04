"use client";
import { useState } from "react";
import { Checkbox } from "../../ui/checkbox";
import { Member, Task } from "@/types/typeData";

type TaskItemProps = {
  task: Task;
  member: Member; // jika member opsional
};

export default function TaskItem({ task, member }: TaskItemProps) {
  const [expanded, setExpanded] = useState(false);

  if (!member) {
    return <div className="p-2">Loading member...</div>;
  }

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`flex items-center justify-between p-2 rounded-xl border transition
    ${task.done ? `${member?.iconColor} border-gray-200` : "bg-white border-gray-300 hover:border-gray-400"}`}
    >
      <div className={`flex gap-3 ${expanded ? "flex-col items-center text-balance w-full" : "flex-row items-center"}`}>
        <span className="text-xl">{task.icon}</span>
        <div className=" max-w-[200px]">
          <p className={`font-medium ${expanded ? "whitespace-normal" : "truncate"}`}>{task.label}</p>
          <p className={`text-xs text-gray-500 ${expanded ? "text-center" : "text-left"}`}>{task.period}</p>
        </div>
      </div>
      <Checkbox
        id="toggle-2"
        checked={task.done}
        className={`data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white`}
        
      />
    </div>
  );
}
