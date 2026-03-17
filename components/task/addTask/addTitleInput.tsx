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

export default function AddMemberName({
  icon,
  label,
  placeholder = "Enter text...",
  value,
  onChange,
  className = "",
  inputClassName = "",
}: InputWithIconProps) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#07111f]/80 ${className}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        {icon && <div className="text-slate-400">{icon}</div>}
        <div className="flex-1">
          {label && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>}
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`h-9 w-full bg-transparent text-lg text-white placeholder:text-slate-500 focus:outline-none ${inputClassName}`}
          />
        </div>
      </div>
    </div>
  );
}
