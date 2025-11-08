"use client";
import { Card } from "@/components/ui/card";
import CheckButton from "./checkButton";
import { Member, Task } from "@/types/typeData";
import { formatTimeToAmPm } from "@/helper/timeFormat";

type TaskItemProps = {
  task: Task;
  member: Member;
};

export default function TaskCard({ task, member }: TaskItemProps) {
  // const toggleTask = useTaskStore((state) => state.toggleTask); // ✅ digunakan di CheckButton

  return (
    <Card className={`max-w-[400px] rounded-4xl ${task.completed ? member.taskColorDone : member.taskColor}`}>
      <div className="flex items-center justify-between px-4">
        <div className="min-w-0">
          <p className="px-2 font-bold line-clamp-1">{task.label}</p>
          <p className="px-2 text-gray-500 text-sm truncate">{formatTimeToAmPm(task.time)}</p>
        </div>
        <div className="shrink-0">
          <CheckButton member={member} task={task} />
        </div>
      </div>
    </Card>
  );
}
