import Image from "next/image";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/animate-ui/components/radix/dialog";
import { Pencil, Trash2, Star } from "lucide-react";
import { Member, Reward } from "@/types/domain";
import { useRewardStore } from "@/lib/store/reward-store";
import RewardEditForm from "./rewardEditForm";
import { useState } from "react";
import Confetti from "./convetti";
import RewardClaim from "./rewardClaim";
import { checkRewardEligibility } from "@/lib/reward/rewardEligibility";

type Props = {
  reward: Reward;
  member: Member;
  setOpen: (v: boolean) => void;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
};

export default function RewardCardDialog({ reward, member, setOpen, isEditing, setIsEditing }: Props) {
  const [celebrating, setCelebrating] = useState(false);
  const { eligible, remaining } = checkRewardEligibility(member, reward);

  const handleClaim = () => {
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 4000);
  };

  const { deleteReward } = useRewardStore();

  if (!reward) return null;
  if (!member) return null;

  return (
    <DialogContent className="rounded-4xl w-[450px] p-6">
      <DialogHeader>
        <DialogTitle className="text-3xl font-semibold mb-4 line-clamp-2">{isEditing ? "Edit Reward" : reward.name}</DialogTitle>
      </DialogHeader>

      {isEditing ? (
        <RewardEditForm reward={reward} setOpen={setOpen} setIsEditing={setIsEditing} />
      ) : (
        <>
          {/* IMAGE */}
          <div className="w-full flex justify-center mb-6">
            <div className="w-40 h-40 rounded-3xl overflow-hidden shadow bg-white">
              <Image src={reward.image} alt={reward.name} width={160} height={160} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* MIN STARS */}
          <div
            className={`
              flex items-center justify-center gap-2 
              px-3 py-2 rounded-3xl w-fit mx-auto mb-6
              ${member.bgColor ?? "bg-gray-100"}
            `}
          >
            <Star size={18} fill="#eab308" color="#eab308" />
            <span className="text-sm font-medium">{reward.minStars} Min stars</span>
          </div>

          {/* ACTION BUTTONS */}
          <div className="w-full flex justify-center mb-6">
            <div className="w-3/4 flex gap-4">
              <button className="flex-1 h-14 rounded-4xl bg-gray-100 hover:bg-gray-200 cursor-pointer flex flex-col items-center justify-center" onClick={() => setIsEditing(true)}>
                <Pencil size={18} />
                <span className="text-sm mt-1">Edit</span>
              </button>

              <button
                className="flex-1 h-14 rounded-4xl bg-gray-100 text-red-500 hover:bg-gray-200 cursor-pointer flex flex-col items-center justify-center"
                onClick={async () => {
                  await deleteReward(reward.id);
                  setOpen(false);
                }}
              >
                <Trash2 size={18} />
                <span className="text-sm mt-1">Delete</span>
              </button>
            </div>
          </div>

          {/* CLAIM */}
          {celebrating && <Confetti />}

          <RewardClaim
            celebrating={false}
            onClaim={() => {
              if (!eligible) return alert(`Butuh ${remaining} stars lagi!`);
              handleClaim();
            }}
          />
        </>
      )}
    </DialogContent>
  );
}

