"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import AddRewardForm from "@/components/reward/addRewardForm";
import { useLanguage } from "@/components/language-provider";

const contentBtn = {
  id: { add: "Tambah hadiah" },
  en: { add: "Add reward" }
};

export default function AddButtonReward() {
  const { locale } = useLanguage();
  const t = contentBtn[locale];
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="flex h-12 items-center gap-2 rounded-2xl border border-violet-200 bg-violet-100/50 px-4 text-violet-800 transition hover:bg-violet-200/50 dark:border-violet-300/20 dark:bg-violet-400/15 dark:text-violet-50 dark:hover:bg-violet-400/20"
        onClick={() => setOpen(true)}
      >
        <Plus size={18} />
        <span className="font-semibold">{t.add}</span>
      </button>

      <AddRewardForm isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
