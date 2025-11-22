"use client";
import { ReactNode } from "react";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

interface FloatButtonProps {
  icon?: ReactNode;
  onClick?: () => void;
  position?: string;
  bgColor?: string;
  size?: string;
  floating?: boolean;
  shadow?: boolean;
}

export default function FloatButton({ icon, onClick, position = "bottom-10 right-10", bgColor = "bg-blue-500", size = "w-14 h-14", floating = true, shadow = true }: FloatButtonProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={`${floating ? `fixed ${position} z-50` : ""}
      flex items-center justify-center rounded-full cursor-pointer
      ${bgColor} ${size}
      ${shadow ? "shadow-lg" : "shadow-none"}`}
      onClick={onClick}
    >
      {icon || <Plus color="white" size={isMobile ? 20 : 35} />}
    </div>
  );
}
