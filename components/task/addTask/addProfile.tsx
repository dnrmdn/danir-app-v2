import ModalOverlay from "./modalOverlayUI";
import GlassCard from "./glassCardUI";
import { ArrowLeft } from "lucide-react";
import ColorPicker from "./colorsPicker";
import { useState } from "react";
import { useMemberStore } from "@/lib/store/member-store";
import AddMemberName from "./addTitleInput";

export default function AddProfile({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const addMember = useMemberStore((state) => state.addMember);
  const isAdding = useMemberStore((state) => state.isAdding);

  const [name, setName] = useState("");
  const [colorIndex, setColorIndex] = useState<number | null>(null);

  const handleSave = async () => {
    if (!name.trim()) return alert("Name cannot be empty");
    if (colorIndex === null) return alert("Please select a color");

    const success = await addMember({
      name,
      colorIndex,
    });

    if (success) {
      setName("");
      setColorIndex(null);
      onClose();
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <GlassCard className="h-full rounded-l-4xl flex flex-col">
        {/* Header */}
        <div className="flex gap-4 items-center mb-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-black/50 transition"
          >
            <ArrowLeft size={22} className="text-black hover:text-white transition" />
          </button>
          <h2 className="text-4xl font-semibold">Add Profile</h2>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <AddMemberName label="Name" placeholder="Create your name here..." value={name} onChange={(e) => setName(e.target.value)} />

          {/* Color Picker */}
          <ColorPicker onSelect={(i) => setColorIndex(i)} />

          {/* Submit Button */}
          <button onClick={handleSave} disabled={isAdding} className={`rounded-xl p-3 transition text-white ${isAdding ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}>
            {isAdding ? "Saving..." : "Add Profile"}
          </button>
        </div>
      </GlassCard>
    </ModalOverlay>
  );
}
