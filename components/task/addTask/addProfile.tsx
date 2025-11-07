
import ModalOverlay from "./modalOverlayUI";
import GlassCard from "./glassCardUI";
import { ArrowLeft } from "lucide-react";
import InputWithIcon from "./addTitleInput";
import ColorPicker from "./colorsPicker";

export default function AddProfile({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <GlassCard className="h-full rounded-l-4xl flex flex-col">
        {/* Header */}
        <div className="flex gap-4 items-center mb-6">
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/50 transition">
            <ArrowLeft size={22} className="text-black hover:text-white transition" />
          </button>
          <h2 className="text-4xl font-semibold">Add Profile</h2>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <InputWithIcon label="Name" placeholder="Create your name here..." />
          <div>
            <div>
              <ColorPicker/>
            </div>
          </div>
          <button className="bg-blue-500 text-white rounded-xl p-3 hover:bg-blue-600 transition">Add Task</button>
        </div>
      </GlassCard>
    </ModalOverlay>
  );
}
