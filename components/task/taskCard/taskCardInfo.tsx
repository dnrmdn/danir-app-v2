import { Calendar, Users } from "lucide-react";
import { formatTimeToAmPm } from "@/lib/helpers/timeFormat";
import { Member, Task } from "@/types/domain";

type TaskCardProps = {
  task: Task;
  member: Member;
};

export default function TaskCardInfo({ task, member } : TaskCardProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-3">
        <Calendar size={30} className="text-gray-500" />
        <p className="text-gray-700 text-xl">
          {task.time ? formatTimeToAmPm(task.time) : "No time set"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Users size={30} className="text-gray-500" />
        <div>
          <p className="text-gray-500 text-sm">Assigned to</p>
          <p className="font-medium text-xl">{member.name}</p>
        </div>
      </div>
    </div>
  );
}

