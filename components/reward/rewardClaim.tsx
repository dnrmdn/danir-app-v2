import { Button } from "../ui/button";

interface CelebrationScreenProps {
  onClaim: () => void;
  celebrating: boolean;
}

export default function RewardClaim({ onClaim, celebrating }: CelebrationScreenProps) {
  return (
    <div className={`text-center transition-all duration-500 ${celebrating ? "scale-110" : "scale-100"}`}>
      <div className="space-y-4">
        <Button
          onClick={onClaim}
          disabled={celebrating}
          className={`px-8 py-6 text-lg font-bold rounded-full transition-all ${celebrating ? "bg-yellow-300 text-birthday-purple scale-105" : "bg-linear-to-r from-birthday-yellow to-birthday-orange hover:shadow-2xl"}`}
        >
          {celebrating ? "🎊 Celebrating! 🎊" : "Claim Your Reward🥳"}
        </Button>
      </div>
    </div>
  );
}
