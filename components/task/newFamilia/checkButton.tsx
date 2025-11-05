import { Member, Task } from "@/types/typeData";
import { Check } from "lucide-react";

type CheckButtonProps = {
  member: Member;
  task: Task;
};

export default function CheckButton({ member, task }: CheckButtonProps) {
  const isDone = task.done;

  return (
    <div>
      <div
        className={`relative w-10 h-10 rounded-full flex items-center justify-center border transition
          ${isDone ? `${member.iconColor}` : "bg-white border-gray-300"}`}
      >
        {isDone && <Check size={24} color="white" />}
      </div>
    </div>
  );
}
