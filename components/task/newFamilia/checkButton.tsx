import { useTaskStore } from "@/lib/store/task-store";
import { Member, Task } from "@/types/typeData";
import { Check } from "lucide-react";

type CheckButtonProps = {
  member: Member;
  task: Task;
};

export default function CheckButton({ member, task }: CheckButtonProps) {
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const isDone = task.completed;

  return (
    <label className="relative w-10 h-10 cursor-pointer">
      {/* Checkbox invisible tapi tetap accessible */}
      <input type="checkbox" checked={isDone} onChange={() => toggleTask(member.id, task.id)} className="sr-only" />

      {/* Tampilan custom */}
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200
    ${isDone ? `${member.iconColor} border-transparent` : "bg-white border-gray-300 hover:border-gray-400"}`}
      >
        {isDone && <Check size={16} color="white" strokeWidth={3} />}
      </div>
    </label>
  );
}
