
import { Member } from "@/types/typeData";
import { Check } from "lucide-react";

type TodoCheckboxProps = {
  member: Member
  checked: boolean;
  onToggle: () => void;
};

export default function CheckButton({ member, checked, onToggle }: TodoCheckboxProps) {
  

  return (
    <label className="relative w-10 h-10 cursor-pointer">
      {/* Checkbox invisible tapi tetap accessible */}
      <input type="checkbox" checked={checked} onChange={onToggle} className="sr-only" />

      {/* Tampilan custom */}
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200
    ${checked ? `${member.iconColor} border-transparent` : "bg-white border-gray-300 hover:border-gray-400"}`}
      >
        {checked && <Check size={16} color="white" strokeWidth={3} />}
      </div>
    </label>
  );
}
