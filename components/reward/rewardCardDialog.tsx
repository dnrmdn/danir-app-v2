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

import { useLanguage } from "@/components/language-provider";

type Props = {
  reward: Reward;
  member: Member;
  setOpen: (v: boolean) => void;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
};

const contentDialog = {
  id: {
    editTitle: "Edit hadiah",
    desc: "Detail hadiah, kebutuhan bintang, dan status klaim untuk member ini.",
    edit: "Edit",
    delete: "Hapus",
    minStars: "minimal bintang",
    needMore: (rem: number) => `Butuh ${rem} bintang lagi sebelum hadiah ini bisa diklaim.`,
    alertMore: (rem: number) => `Butuh ${rem} bintang lagi!`
  },
  en: {
    editTitle: "Edit reward",
    desc: "Reward details, required stars, and claim status for this member.",
    edit: "Edit",
    delete: "Delete",
    minStars: "minimum stars",
    needMore: (rem: number) => `Need ${rem} more star${rem === 1 ? "" : "s"} before this reward can be claimed.`,
    alertMore: (rem: number) => `Need ${rem} more stars!`
  }
};

export default function RewardCardDialog({ reward, member, setOpen, isEditing, setIsEditing }: Props) {
  const { locale } = useLanguage();
  const t = contentDialog[locale];
  const [celebrating, setCelebrating] = useState(false);
  const { eligible, remaining } = checkRewardEligibility(member, reward);

  const handleClaim = () => {
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 4000);
  };

  const { deleteReward } = useRewardStore();

  if (!reward || !member) return null;

  return (
    <DialogContent className="w-[480px] rounded-[2rem] border border-border bg-popover/95 p-6 text-popover-foreground shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#08111f]/95 dark:text-white">
      <DialogHeader>
        <DialogTitle className="mb-1 line-clamp-2 text-3xl font-black text-foreground dark:text-white">
          {isEditing ? t.editTitle : reward.name}
        </DialogTitle>
        {!isEditing && <p className="text-sm text-muted-foreground dark:text-slate-400">{t.desc}</p>}
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
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{reward.minStars} {t.minStars}</span>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-muted/50 text-foreground transition hover:bg-muted dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
              onClick={() => setIsEditing(true)}
            >
              <Pencil size={18} />
              {t.edit}
            </button>

            <button
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-100 text-red-800 transition hover:bg-red-200 dark:border-red-400/15 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/15"
              onClick={async () => {
                await deleteReward(reward.id);
                setOpen(false);
              }}
            >
              <Trash2 size={18} />
              {t.delete}
            </button>
          </div>

          {celebrating && <Confetti />}

          {!eligible && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-100 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100">
              {t.needMore(remaining)}
            </div>
          )}

          <RewardClaim
            celebrating={celebrating}
            onClaim={() => {
              if (!eligible) return alert(t.alertMore(remaining));
              handleClaim();
            }}
          />
        </>
      )}
    </DialogContent>
  );
}
