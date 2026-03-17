import { useState } from "react";
import { useTaskStore } from "@/lib/store/task-store";
import { Task } from "@/types/domain";

type Props = {
  task: Task;
  setOpen: (v: boolean) => void;
  setIsEditing: (v: boolean) => void;
};

export default function TaskCardEditForm({ task, setOpen, setIsEditing }: Props) {
  const { updateTask } = useTaskStore();

  const [data, setData] = useState({
    label: task.label,
    date: task.date || "",
    time: task.time || "",
    reward: String(task.reward ?? 0),
    completed: task.completed,
  });

  const save = async () => {
    await updateTask(task.id, {
      ...data,
      reward: Number(data.reward),
    });

    setIsEditing(false);
    setOpen(false);
  };

  return (
    <div className="mb-6 space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-300">Label</label>
        <input
          type="text"
          value={data.label}
          onChange={(e) => setData({ ...data, label: e.target.value })}
          className="w-full rounded-2xl border border-white/10 bg-[#07111f]/80 px-4 py-3 text-white outline-none placeholder:text-slate-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Date</label>
          <input
            type="date"
            value={data.date}
            onChange={(e) => setData({ ...data, date: e.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-[#07111f]/80 px-4 py-3 text-white outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Time</label>
          <input
            type="time"
            value={data.time}
            onChange={(e) => setData({ ...data, time: e.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-[#07111f]/80 px-4 py-3 text-white outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-300">Reward points</label>
        <input
          type="number"
          value={data.reward}
          onChange={(e) => setData({ ...data, reward: e.target.value })}
          className="w-full rounded-2xl border border-white/10 bg-[#07111f]/80 px-4 py-3 text-white outline-none"
        />
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
        <input
          type="checkbox"
          checked={data.completed}
          onChange={(e) => setData({ ...data, completed: e.target.checked })}
          className="h-4 w-4 rounded border-white/10 bg-[#07111f]"
        />
        Mark task as completed
      </label>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => setIsEditing(false)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-200 transition hover:bg-white/10"
        >
          Cancel
        </button>

        <button
          onClick={save}
          className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2.5 font-semibold text-cyan-100 transition hover:bg-cyan-400/15"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}
