import { Button } from "../ui/button";

interface CelebrationScreenProps {
  onClaim: () => void;
  celebrating: boolean;
}

export default function RewardClaim({ onClaim, celebrating }: CelebrationScreenProps) {
  return (
    <div className={`text-center transition-all duration-500 ${celebrating ? "scale-105" : "scale-100"}`}>
      <div className="space-y-4">
        <Button
          onClick={onClaim}
          disabled={celebrating}
          className={`rounded-full px-8 py-6 text-lg font-bold transition-all ${
            celebrating
              ? "border border-emerald-300/20 bg-emerald-400/15 text-emerald-100"
              : "border border-violet-300/20 bg-violet-400/15 text-violet-50 hover:bg-violet-400/20"
          }`}
        >
          {celebrating ? "🎊 Celebrating! 🎊" : "Claim reward"}
        </Button>
      </div>
    </div>
  );
}
