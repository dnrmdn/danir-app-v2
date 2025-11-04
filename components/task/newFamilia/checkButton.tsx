import { Member } from "@/types/typeData";
import { Check } from "lucide-react";

export default function CheckButton({ member }: { member: Member }) {
  return (
    <div>
      <div className={`relative w-10 h-10 rounded-full ${member.iconColor}`}>
        <Check size={30} color="white" className="absolute inset-0 m-auto" />
      </div>
    </div>
  );
}
