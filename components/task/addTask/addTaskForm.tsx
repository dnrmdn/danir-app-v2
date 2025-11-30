"use client";

import { SortAsc } from "lucide-react";
import { useState } from "react";
import { useTaskStore } from "@/lib/store/task-store";
import AddFormCard from "@/components/shared/addFormCard";
import AddMemberName from "./addTitleInput";
import Profile from "./profile";
import AddDateInput from "./addDateInput";
import AddTimeInput from "./addTimeInput";
import AddReward from "./addReward";

export default function AddTaskForm({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const addTask = useTaskStore((s) => s.addTask);

  const [label, setLabel] = useState("");
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reward, setReward] = useState("");

  const handleSubmit = async () => {
    if (!label.trim()) return alert("Task title required");

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
    <AddFormCard isOpen={isOpen} onClose={onClose} title="Add Task" onSubmit={handleSubmit}>
      <AddMemberName icon={<SortAsc size={30} />} label="Title" placeholder="Task title..." onChange={(e) => setLabel(e.target.value)} />
      <Profile onSelect={(ids) => setMemberIds(ids)} />
      <AddDateInput onChange={(d) => setDate(d?.toISOString() ?? "")} />
      <AddTimeInput onChange={(t) => setTime(t)} />
      <AddReward onChange={(r) => setReward(r)} />
    </AddFormCard>
  );
}
