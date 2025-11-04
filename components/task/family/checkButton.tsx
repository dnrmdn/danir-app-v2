import { Check } from "lucide-react";

export default function CheckButton() {
  const member = {
    name: "Dani",
    CheckIcon: "bg-red-300",
  };

  return (
    <div>
      <div className={`relative w-10 h-10 rounded-full ${member.CheckIcon}`}>
        <Check size={30} color="white" className="absolute inset-0 m-auto" />
      </div>
    </div>
  );
}
