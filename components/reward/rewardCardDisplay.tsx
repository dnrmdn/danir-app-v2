import { Card } from "@/components/ui/card";
import { checkRewardEligibility } from "@/lib/reward/rewardEligibility";
import { Member, Reward } from "@/types/domain";
import { LockKeyhole, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/components/language-provider";

type Props = {
  member: Member;
  reward: Reward;
  onOpen: () => void;
};

const contentDisp = {
  id: {
    canClaimHover: "Kamu bisa klaim hadiah ini!",
    needHover: (rem: number) => `Butuh ${rem} bintang lagi untuk klaim`,
    ready: "Siap diklaim",
    locked: "Terkunci",
    minStars: "minimal bintang",
    alreadyReach: "Hadiah ini sudah bisa diklaim.",
    moreStars: (rem: number) => `Butuh ${rem} bintang lagi untuk membuka.`
  },
  en: {
    canClaimHover: "You can claim this reward!",
    needHover: (rem: number) => `Need ${rem} more stars to claim`,
    ready: "Ready to claim",
    locked: "Locked",
    minStars: "minimum stars",
    alreadyReach: "This reward is already within reach.",
    moreStars: (rem: number) => `${rem} more stars needed to unlock.`
  }
};

export default function RewardCardDisplay({ reward, member, onOpen }: Props) {
  const { locale } = useLanguage();
  const t = contentDisp[locale];
  const { eligible, remaining } = checkRewardEligibility(member, reward);
  const rewardName = reward?.name || "Reward";
  const rewardStars = reward?.minStars ?? 0;

  return (
    <Card
      onClick={onOpen}
      className={`max-w-[400px] cursor-pointer rounded-[2rem] border-0 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${member.taskColor} ${eligible ? "ring-2 ring-emerald-400/70" : "opacity-90"}`}
      title={eligible ? t.canClaimHover : t.needHover(remaining)}
    >
      <div className="flex items-start gap-4 p-4">
        <div className="h-20 w-20 overflow-hidden rounded-[1.25rem] bg-white dark:bg-white/10 shadow-sm">
          <Image
            src={reward?.image || "/file.svg"}
            alt={reward?.name || "Reward"}
            width={160}
            height={160}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-1 flex-col">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${eligible ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-700" : "bg-white/70 text-slate-600 dark:bg-black/20 dark:text-slate-300"}`}>
              {eligible ? t.ready : t.locked}
            </span>
            {eligible ? <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400" /> : <LockKeyhole size={16} className="text-slate-500 dark:text-slate-400" />}
          </div>

          <p className="line-clamp-1 text-lg font-black text-slate-800 dark:text-white">{rewardName}</p>

          <div className="mt-3 flex items-center gap-2">
            <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${member.bgColor}`}>
              <Star size={15} fill="#eab308" color="#eab308" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{rewardStars}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t.minStars}</p>
          </div>

          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {eligible ? t.alreadyReach : t.moreStars(remaining)}
          </div>
        </div>
      </div>
    </Card>
  );
}
