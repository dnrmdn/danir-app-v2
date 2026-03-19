import { Member } from "@/types/domain";
import { Check } from "lucide-react";

interface TodoProgressBarProps {
  total: number;
  completed: number;
  member: Member;
}

export default function TodoProgressBar({ total, completed, member }: TodoProgressBarProps) {
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="relative w-full h-6">
      {/* Background */}
      <div className={`w-full h-full ${member.taskColor} rounded-full`} />

      {/* Progress fill */}
      <div
        className={`absolute top-0 left-0 h-full ${member.iconColor} rounded-full transition-all duration-500`}
        style={{ width: `${progress}%` }}
      />

      {/* Text layer (selalu di tengah) */}
      <div className="absolute inset-0 flex items-center justify-center text-gray-700 dark:text-slate-200 font-medium text-sm select-none">
        <Check size={18} className="mr-1" />
        {completed}/{total}
      </div>
    </div>
  );
}

