import { Member } from "@/types/domain";
import { Check } from "lucide-react";

type TodoCheckboxProps = {
  member: Member;
  checked: boolean;
  onToggle: () => void;
};

export default function CheckButton({ member, checked, onToggle }: TodoCheckboxProps) {
  return (
    <label className="relative flex h-10 w-10 cursor-pointer items-center justify-center">
      <input type="checkbox" checked={checked} onChange={onToggle} className="sr-only" />
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
          checked
            ? `${member.iconColor} border-transparent shadow-sm`
            : "border-slate-300 bg-white/80 hover:border-slate-400"
        }`}
      >
        {checked && <Check size={16} color="white" strokeWidth={3} />}
      </div>
    </label>
  );
}
