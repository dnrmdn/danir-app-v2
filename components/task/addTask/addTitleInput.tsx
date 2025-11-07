import { ReactNode } from "react";

interface InputWithIconProps {
  icon?: ReactNode;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  inputClassName?: string;
}

export default function InputWithIcon({ icon, label, placeholder = "Enter text...", value, onChange, className = "", inputClassName = "" }: InputWithIconProps) {
  return (
    <div className={`bg-gray-100 rounded-lg ${className}`}>
      <div className="flex items-center px-4 gap-2">
        {icon && <div className="text-gray-600">{icon}</div>}
        <div className="flex-1 pt-2">
          {label && <p className="text-sm px-2 text-gray-400">{label}</p>}
          <input type="text" placeholder={placeholder} value={value} onChange={onChange} className={`w-full h-10 mb-1 px-2 rounded-md text-xl bg-transparent focus:outline-none ${inputClassName}`} />
        </div>
      </div>
    </div>
  );
}
