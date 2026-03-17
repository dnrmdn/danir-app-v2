import { useState } from "react";
import { Reward } from "@/types/domain";
import { useRewardStore } from "@/lib/store/reward-store";
import Image from "next/image";

type Props = {
  reward: Reward;
  setOpen: (v: boolean) => void;
  setIsEditing: (v: boolean) => void;
};

export default function RewardEditForm({ reward, setOpen, setIsEditing }: Props) {
  const { updateReward } = useRewardStore();

  const [data, setData] = useState({
    name: reward.name,
    image: reward.image,
    minStars: String(reward.minStars),
  });

  const [preview, setPreview] = useState<string>(reward.image);

  function handleSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);

    const reader = new FileReader();
    reader.onloadend = () => {
      setData({ ...data, image: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  const save = async () => {
    await updateReward(reward.id, {
      ...data,
      minStars: Number(data.minStars),
    });

    setIsEditing(false);
    setOpen(false);
  };

  return (
    <div className="mb-6 space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-300">Reward name</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          className="w-full rounded-2xl border border-white/10 bg-[#07111f]/80 px-4 py-3 text-white outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">Reward image</label>
        {preview && (
          <div className="relative h-28 w-28 overflow-hidden rounded-2xl border border-white/10">
            <Image src={preview} alt="Preview" fill unoptimized className="object-cover" />
          </div>
        )}

        <div>
          <input id="fileInputEditReward" type="file" accept="image/*" onChange={handleSelectFile} className="hidden" />
          <label htmlFor="fileInputEditReward" className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10">
            Select image
          </label>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-300">Minimum stars</label>
        <input
          type="number"
          value={data.minStars}
          onChange={(e) => setData({ ...data, minStars: e.target.value })}
          className="w-full rounded-2xl border border-white/10 bg-[#07111f]/80 px-4 py-3 text-white outline-none"
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => setIsEditing(false)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-200 transition hover:bg-white/10"
        >
          Cancel
        </button>

        <button
          onClick={save}
          className="rounded-2xl border border-violet-300/20 bg-violet-400/15 px-4 py-2.5 font-semibold text-violet-50 transition hover:bg-violet-400/20"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}
