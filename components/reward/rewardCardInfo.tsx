import Image from "next/image";
import { Star, Users } from "lucide-react";
import { Member, Reward } from "@/types/domain";

type Props = {
  reward: Reward;
  member: Member;
};

export default function RewardCardInfo({ reward, member }: Props) {
  return (
    <div className="space-y-6 mb-6">
      {/* IMAGE */}
      <div className="w-full flex justify-center">
        <div className="w-40 h-40 rounded-3xl overflow-hidden shadow bg-white">
          <Image
            src={reward.image}
            alt={reward.name}
            width={160}
            height={160}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* MINIMUM STARS */}
      <div className="flex items-center gap-3 text-xl">
        <Star size={28} className="text-yellow-500" fill="#eab308" />
        <p className="text-gray-800 font-medium">
          {reward.minStars} minimum stars required
        </p>
      </div>

      {/* MEMBER (optional) */}
      <div className="flex items-center gap-3">
        <Users size={28} className="text-gray-500" />
        <div>
          <p className="text-gray-500 text-sm">Available for</p>
          <p className="font-medium text-xl">{member.name}</p>
        </div>
      </div>
    </div>
  );
}

