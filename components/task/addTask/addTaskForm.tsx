import { members } from "../data/members";
import AddDateInput from "./addDateInput";
import AddTimeInput from "./addTimeInput";
import ModalOverlay from "./modalOverlayUI";
import GlassCard from "./glassCardUI";
import { SortAsc, X } from "lucide-react";
import Profile from "./profile";
import InputWithIcon from "./addTitleInput";

export default function AddTaskForm({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <GlassCard className="h-full rounded-l-4xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl pl-4 font-semibold">Add Task</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/50 transition">
            <X size={22} className="text-black hover:text-white transition" />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <InputWithIcon icon={<SortAsc size={30} />} label="Title" placeholder="Create your task title here..." />
          <Profile members={members} />
          <AddDateInput />
          <AddTimeInput />
          <button className="bg-blue-500 text-white rounded-xl p-3 hover:bg-blue-600 transition">Add Task</button>
        </div>
        
      </GlassCard>
    </ModalOverlay>
  );
}
