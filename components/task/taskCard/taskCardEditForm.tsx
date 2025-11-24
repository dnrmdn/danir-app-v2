import { useState } from "react";
import { useTaskStore } from "@/lib/store/task-store";
import { Task } from "@/types/typeData";

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
    <div className="space-y-4 mb-6">
      {/* Label */}
      <div>
        <label className="text-gray-600 text-sm">Label</label>
        <input type="text" value={data.label} onChange={(e) => setData({ ...data, label: e.target.value })} className="w-full border rounded-xl px-3 py-2" />
      </div>

      {/* Date */}
      <div>
        <label className="text-gray-600 text-sm">Date</label>
        <input type="date" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} className="w-full border rounded-xl px-3 py-2" />
      </div>

      {/* Time */}
      <div>
        <label className="text-gray-600 text-sm">Time</label>
        <input type="time" value={data.time} onChange={(e) => setData({ ...data, time: e.target.value })} className="w-full border rounded-xl px-3 py-2" />
      </div>

      {/* Reward */}
      <div>
        <label className="text-gray-600 text-sm">Reward</label>
        <input type="number" value={data.reward} onChange={(e) => setData({ ...data, reward: e.target.value })} className="w-full border rounded-xl px-3 py-2" />
      </div>

      {/* Completed */}
      <div className="flex items-center gap-3">
        <input type="checkbox" checked={data.completed} onChange={(e) => setData({ ...data, completed: e.target.checked })} />
        <label className="text-gray-700 text-sm">Completed</label>
      </div>

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
