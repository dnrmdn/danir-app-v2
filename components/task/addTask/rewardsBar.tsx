import { Member } from "@/types/domain";
import { Star } from "lucide-react";

interface RewardsBarProps {
  member: Member;
}

export default function RewardsBar({ member }: RewardsBarProps) {
  // Ambil hanya task yang sudah selesai DAN punya reward
  const completedWithReward = member.tasks.filter(
    (t) => t.completed && typeof t.reward === "number"
  );

  // Hitung total reward
  const totalReward = completedWithReward.reduce(
    (sum, t) => sum + (t.reward ?? 0),
    0
  );

  // Kalau tidak ada reward sama sekali, jangan tampilkan
  if (completedWithReward.length === 0) return null;

  return (
    <div className="relative w-38 h-6">
      {/* Background */}
      <div className={`w-full h-full ${member.taskColor} rounded-full`} />

      {/* Teks tengah (ikon + angka) */}
      <div className="absolute inset-0 flex items-center justify-center text-gray-700 font-medium text-sm select-none">
        <Star size={18} className="mr-1 text-yellow-500" fill="#eab308"  />
        {totalReward}
      </div>
    </div>
  );
}

