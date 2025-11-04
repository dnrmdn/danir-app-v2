import { Card } from "@/components/ui/card";
import CheckButton from "./checkButton";
import { Member, Task } from "@/types/typeData";

type TaskItemProps = {
  task: Task;
  member: Member;
};

export default function TaskCard({ task, member }: TaskItemProps) {
  return (
    <Card className={`max-w-[400px] rounded-4xl ${task.done ? member.taskColorDone : member.taskColor}`}>
      <div className="flex items-center justify-between px-4">
        <div>
          <p className="px-4 font-bold line-clamp-1">{task.label}</p>
          <p className="px-4 text-gray-500 text-sm truncate">{task.period}</p>
        </div>
        <CheckButton member={member} />
      </div>
    </Card>
  );
}
