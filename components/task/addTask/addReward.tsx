import { Star } from "lucide-react";

export default function AddReward({ onChange }: { onChange?: (v: string) => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#07111f]/80">
      <div className="flex h-[68px] max-w-full items-center gap-3 px-4">
        <Star size={22} className="text-yellow-400" fill="#facc15" />
        <div className="flex-1">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Reward points</p>
          <input className="w-full bg-transparent text-base text-white outline-none placeholder:text-slate-500" placeholder="Reward" onChange={(e) => onChange?.(e.target.value)} />
        </div>
      </div>
    </div>
  );
}
