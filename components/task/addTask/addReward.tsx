import { Star } from "lucide-react";

export default function AddReward({
  onChange,
}: {
  onChange?: (v: string) => void;
}) {
  return (
    <div className="bg-gray-100 rounded-lg">
      <div className="flex max-w-full h-18 items-center px-4 gap-2">
        <Star size={30} />
        <div className="flex-1 pt-1">
          <input
            className="w-full h-full text-xl outline-0 pl-2"
            placeholder="Reward"
            onChange={(e) => onChange?.(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
