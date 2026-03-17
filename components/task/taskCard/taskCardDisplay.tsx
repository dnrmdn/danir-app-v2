import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/helpers/dateFormat";
import { formatTimeToAmPm } from "@/lib/helpers/timeFormat";
import { Member, Task } from "@/types/domain";
import { Star } from "lucide-react";
import CheckButton from "../addTask/checkButton";
import { useTaskStore } from "@/lib/store/task-store";
import { capitalize } from "@/lib/helpers/capitalized";

type Props = {
  task: Task;
  member: Member;
  onOpen: () => void;
};

export default function TaskCardDisplay({ task, member, onOpen }: Props) {
  const { toggleTask } = useTaskStore();
  return (
    <Card onClick={onOpen} className={`max-w-[400px] rounded-4xl cursor-pointer ${task.completed ? member.taskColorDone : member.taskColor}`}>
      <div className="flex justify-between items-start px-4 py-3 gap-3">
        <div className="flex flex-col flex-1 pl-2 items-start">
          <p className="font-bold line-clamp-1 text-left">{capitalize(task.label)}</p>

          <div className="flex items-center flex-wrap gap-2 mt-1">
            {task.date && <p className="text-gray-500 text-sm">{formatDate(task.date)}</p>}
            {task.time && <p className="text-gray-500 text-sm">{formatTimeToAmPm(task.time)}</p>}

            {Number(task.reward) > 0 && (
              <div className={`flex items-center ${member.bgColor} rounded-4xl px-2 py-1`}>
                <Star size={15} fill={task.completed ? "#eab308" : "transparent"} color={task.completed ? "#eab308" : "#9ca3af"} className="mr-1" />
                <p className="ml-1 text-gray-700 text-sm">{task.reward}</p>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 mt-1" onClick={(e) => e.stopPropagation()}>
          <CheckButton member={member} checked={task.completed} onToggle={() => toggleTask(task.id)} />
        </div>
      </div>
    </Card>
  );
}

