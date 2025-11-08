import { Member } from "@/types/typeData";

interface TodoProgressBarProps {
  total: number;
  completed: number;
  member: Member
}

export default function TodoProgressBar({ total, completed, member }: TodoProgressBarProps) {
  const progress = total > 0 ? (completed / total) * 100 : 0;

  // warna gradasi dinamis (kuning → biru → hijau)
//   const gradient = `linear-gradient(90deg, #facc15 ${progress * 0.4}%, #3b82f6 ${progress * 0.8}%, #22c55e ${progress}%)`;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">Progress</span>
        <span className="text-gray-600">
          {completed}/{total} tasks
        </span>
      </div>

      <div className={`w-full h-4 ${member.taskColorDone} rounded-full overflow-hidden`}>
        <div
          className={`h-full transition-all ${member.iconColor} rounded-full duration-500`}
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>
    </div>
  );
}
