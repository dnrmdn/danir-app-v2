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

  if (!reward || !member) return null;

  return (
    <DialogContent className="w-[480px] rounded-[2rem] border border-white/10 bg-[#08111f]/95 p-6 text-white backdrop-blur-xl">
      <DialogHeader>
        <DialogTitle className="mb-1 line-clamp-2 text-3xl font-black text-white">
          {isEditing ? "Edit reward" : reward.name}
        </DialogTitle>
        {!isEditing && <p className="text-sm text-slate-400">Reward details, required stars, and claim status for this member.</p>}
      </DialogHeader>

      {isEditing ? (
        <RewardEditForm reward={reward} setOpen={setOpen} setIsEditing={setIsEditing} />
      ) : (
        <>
          <div className="mb-6 flex justify-center">
            <div className="h-40 w-40 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white shadow-sm">
              <Image src={reward.image} alt={reward.name} width={160} height={160} className="h-full w-full object-cover" />
            </div>
          </div>

          <div className={`mx-auto mb-6 flex w-fit items-center justify-center gap-2 rounded-full px-4 py-2 ${member.bgColor ?? "bg-gray-100"}`}>
            <Star size={18} fill="#eab308" color="#eab308" />
            <span className="text-sm font-semibold text-slate-700">{reward.minStars} minimum stars</span>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10"
              onClick={() => setIsEditing(true)}
            >
              <Pencil size={18} />
              Edit
            </button>

            <button
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-red-400/15 bg-red-500/10 text-red-200 transition hover:bg-red-500/15"
              onClick={async () => {
                await deleteReward(reward.id);
                setOpen(false);
              }}
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>

          {celebrating && <Confetti />}

          {!eligible && (
            <div className="mb-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Need {remaining} more star{remaining === 1 ? "" : "s"} before this reward can be claimed.
            </div>
          )}

          <RewardClaim
            celebrating={celebrating}
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
