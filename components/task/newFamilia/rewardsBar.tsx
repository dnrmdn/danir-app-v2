import { Member } from "@/types/typeData";
import { Star } from "lucide-react";

interface RewardsBarProps {
  completed: number;
  member: Member;
}

export default function RewardsBar({ completed, member }: RewardsBarProps) {
  return (
    <div className="relative w-38 h-6">
      {/* Background */}
      <div className={`w-full h-full ${member.taskColor} rounded-full`} />

      {/* Text layer (ikon + teks di tengah) */}
      <div className="absolute inset-0 flex items-center justify-center text-gray-700 font-medium text-sm select-none">
        <Star size={18} className="mr-1 text-yellow-500" />
        {completed}
      </div>
    </div>
  );
}
