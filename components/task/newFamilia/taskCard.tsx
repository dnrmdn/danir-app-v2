"use client";
import { Card } from "@/components/ui/card";
import CheckButton from "./checkButton";
import { Member, Task } from "@/types/typeData";
import { formatTimeToAmPm } from "@/helper/timeFormat";
import { Star } from "lucide-react";
import { useTaskStore } from "@/lib/store/task-store";

type TaskItemProps = {
  task: Task;
  member: Member;
};

export default function TaskCard({ task, member }: TaskItemProps) {
  const toggleTask = useTaskStore((state) => state.toggleTask); // ✅ digunakan di CheckButton
  

  return (
    <Card className={`max-w-[400px] rounded-4xl ${task.completed ? member.taskColorDone : member.taskColor}`}>
      <div className="flex items-center justify-between px-4">
        <div className="min-w-0">
          <p className="px-2 font-bold line-clamp-1">{task.label}</p>
          <div className="flex">
            <p className="flex px-2 py-1 text-gray-500 text-sm truncate">{formatTimeToAmPm(task.time)}</p>
            {task.reward && (
              <div className={`flex items-center justify-center ${member.bgColor} rounded-4xl px-2 py-1 text-gray-700 font-medium text-sm select-none`}>
                <Star
                  size={15}
                  fill={task.completed ? "#eab308" : "transparent"}
                  color={task.completed ? "#eab308" : "#9ca3af"} // kuning atau abu-abu
                  className="mr-1"
                />
                <p className="text-gray-700 text-sm">{task.reward}</p>
              </div>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <CheckButton member={member} checked={task.completed} onToggle={() => toggleTask(task.id)} />
        </div>
      </div>
    </Card>
  );
}
