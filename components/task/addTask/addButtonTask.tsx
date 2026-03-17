"use client";

import { useState } from "react";
import AddTaskForm from "./addTaskForm";
import { Plus } from "lucide-react";

export default function AddButtonTask() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="flex h-12 items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 text-cyan-100 transition hover:bg-cyan-400/15"
        onClick={() => setOpen(true)}
      >
        <Plus size={18} />
        <span className="font-semibold">Add task</span>
      </button>

      <AddTaskForm isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
