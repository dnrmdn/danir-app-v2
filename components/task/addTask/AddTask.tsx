"use client";
import { X } from "lucide-react";
import ModalOverlay from "./modalOverlayUI";
import GlassCard from "./glassCardUI";
import AddTaskForm from "./addTaskForm";

export default function AddTaskCard({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <GlassCard className="h-full rounded-l-4xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl pl-4 font-semibold">Add Task</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/50 transition"
          >
            <X size={22} className="text-black hover:text-white transition" />
          </button>
        </div>

        {/* Form */}
        <AddTaskForm />
      </GlassCard>
    </ModalOverlay>
  );
}
