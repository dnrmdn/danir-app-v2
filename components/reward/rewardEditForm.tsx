import { useState } from "react";
import { Reward } from "@/types/typeData";
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
    <div className="space-y-4 mb-6">
      {/* Name */}
      <div>
        <label className="text-gray-600 text-sm">Reward Name</label>
        <input type="text" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="w-full border rounded-xl px-3 py-2" />
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <label className="text-gray-600 text-sm">Reward Image</label>

        {/* PREVIEW */}
        {preview && (
          <div className="relative w-28 h-28 rounded-xl overflow-hidden border">
            <Image src={preview} alt="Preview" fill unoptimized className="object-cover" />
          </div>
        )}

        {/* BUTTON UPLOAD */}
        <div>
          <input id="fileInput" type="file" accept="image/*" onChange={handleSelectFile} className="hidden" />

          <label htmlFor="fileInput" className="inline-flex w-full h-full items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 cursor-pointer border text-sm">
            <span>📁 Select Image...</span>
          </label>
        </div>
      </div>

      {/* Minimum Stars */}
      <div>
        <label className="text-gray-600 text-sm">Minimum Stars</label>
        <input type="number" value={data.minStars} onChange={(e) => setData({ ...data, minStars: e.target.value })} className="w-full border rounded-xl px-3 py-2" />
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 rounded-xl">
          Cancel
        </button>

        <button onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded-xl">
          Save
        </button>
      </div>
    </div>
  );
}
