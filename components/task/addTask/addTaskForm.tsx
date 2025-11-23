import AddDateInput from "./addDateInput";
import AddTimeInput from "./addTimeInput";
import ModalOverlay from "./modalOverlayUI";
import GlassCard from "./glassCardUI";
import { SortAsc, X } from "lucide-react";
import Profile from "./profile";
import AddReward from "./addReward";
import AddMemberName from "./addTitleInput";
import { useTaskStore } from "@/lib/store/task-store";
import { useState } from "react";

export default function AddTaskForm({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const addTask = useTaskStore((s) => s.addTask);

  const [label, setLabel] = useState("");
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reward, setReward] = useState("");

  const handleSubmit = async () => {
    if (memberIds.length === 0) {
      return alert("Please select at least one member");
    }
    if (!label.trim()) {
      return alert("Task label is required");
    }

    for (const id of memberIds) {
      await addTask({
        label,
        memberId: id,
        date,
        time,
        reward: Number(reward),
        completed: false,
      });
    }

    onClose();
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <GlassCard className="h-full rounded-l-4xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl pl-4 font-semibold">Add Task</h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-black/50 transition"
          >
            <X size={22} className="text-black hover:text-white transition" />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <AddMemberName icon={<SortAsc size={30} />} label="Title" placeholder="Create your task title here..." onChange={(e) => setLabel(e.target.value)} />
          <Profile onSelect={(ids) => setMemberIds(ids)} />
          <AddDateInput onChange={(d) => setDate(d?.toISOString() ?? "")} />
          <AddTimeInput onChange={(t) => setTime(t)} />
          <AddReward onChange={(r) => setReward(r)} />
          <button onClick={handleSubmit} className="bg-blue-500 text-white rounded-xl p-3 hover:bg-blue-600 transition">
            Add Task
          </button>
        </div>
      </GlassCard>
    </ModalOverlay>
  );
}
