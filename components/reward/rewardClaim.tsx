import { Button } from "../ui/button";
import { useLanguage } from "@/components/language-provider";

interface CelebrationScreenProps {
  onClaim: () => void;
  celebrating: boolean;
}

const contentClm = {
  id: {
    claim: "Klaim hadiah",
    celeb: "🎊 Selesai! 🎊"
  },
  en: {
    claim: "Claim reward",
    celeb: "🎊 Celebrating! 🎊"
  }
};

export default function RewardClaim({ onClaim, celebrating }: CelebrationScreenProps) {
  const { locale } = useLanguage();
  const t = contentClm[locale];
  return (
    <div className={`text-center transition-all duration-500 ${celebrating ? "scale-105" : "scale-100"}`}>
      <div className="space-y-4">
        <Button
          onClick={onClaim}
          disabled={celebrating}
          className={`rounded-full px-8 py-6 text-lg font-bold transition-all ${
            celebrating
              ? "border border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-300/20 dark:bg-emerald-400/15 dark:text-emerald-100"
              : "border border-violet-200 bg-violet-100/50 text-violet-800 hover:bg-violet-200/50 dark:border-violet-300/20 dark:bg-violet-400/15 dark:text-violet-50 dark:hover:bg-violet-400/20"
          }`}
        >
          {celebrating ? t.celeb : t.claim}
        </Button>
      </div>
    </div>
  );
}
