import { Card } from "@/components/ui/card";
import { checkRewardEligibility } from "@/lib/reward/rewardEligibility";
import { Member, Reward } from "@/types/domain";
import { Star } from "lucide-react";
import Image from "next/image";

type Props = {
  member: Member;
  reward: Reward;
  onOpen: () => void;
};

export default function RewardCardDisplay({ reward, member, onOpen }: Props) {
  const { eligible, remaining } = checkRewardEligibility(member, reward);
  const rewardName = reward?.name || "Reward";
  const rewardStars = reward?.minStars ?? 0;

  return (
    <Card
      onClick={onOpen}
      className={`
        max-w-[400px]
        rounded-4xl
        cursor-pointer
        ${member.taskColor} 
        hover:scale-[1.02]
        transition-all
        ${eligible ? "ring-2 ring-green-400" : "opacity-80"}
      `}
      title={
        eligible
          ? "You can claim this reward!"
          : `Need ${remaining} more stars to claim`
      }
    >
      <div className="flex items-start p-4 gap-4">
        {/* IMAGE */}
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white shadow">
          <Image
            src={reward?.image || "/file.svg"}
            alt={reward?.name || "Reward"}
            width={160}
            height={160}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/file.svg";
            }}
          />
        </div>

        {/* TEXT CONTENT */}
        <div className="flex flex-col flex-1">
          <p className="font-bold text-lg line-clamp-1">{rewardName}</p>

          <div className="flex items-center gap-2 mt-2">
            <div
              className={`
                flex items-center gap-1 
                px-2 py-1 
                rounded-3xl 
                ${member.bgColor}
              `}
            >
              <Star size={15} fill="#eab308" color="#eab308" />
              <span className="text-sm font-medium">{rewardStars}</span>
            </div>
            <p className="text-gray-600 text-sm">Min stars</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

