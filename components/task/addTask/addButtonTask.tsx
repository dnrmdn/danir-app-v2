"use client";

import { useState } from "react";
import AddTaskForm from "./addTaskForm";
import { Plus } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

const contentBtn = {
  id: { add: "Tambah tugas" },
  en: { add: "Add task" }
};

export default function AddButtonTask() {
  const { locale } = useLanguage();
  const t = contentBtn[locale];
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="flex h-12 items-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-100/50 px-4 text-cyan-800 transition hover:bg-cyan-200/50 dark:border-cyan-300/20 dark:bg-cyan-400/10 dark:text-cyan-100 dark:hover:bg-cyan-400/15"
        onClick={() => setOpen(true)}
      >
        <Plus size={18} />
        <span className="font-semibold">{t.add}</span>
      </button>

      <AddTaskForm isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
