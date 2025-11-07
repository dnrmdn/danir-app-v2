"use client";
import { useEffect, useState, ReactNode } from "react";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

interface FloatButtonProps {
  icon?: ReactNode;
  onClick?: () => void;
  children?: ReactNode;
  position?: string;
  bgColor?: string;
  size?: string;
  floating?: boolean; 
  shadow?: boolean; 
}

export default function FloatButton({ icon, onClick, children, position = "bottom-10 right-10", bgColor = "bg-blue-500", size = "w-14 h-14", floating = true, shadow = true }: FloatButtonProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleClick = () => {
    if (onClick) onClick();
    setOpen(true);
  };

  return (
    <>
      {(!open || !floating)&& (
        <div
          className={`${floating ? `fixed ${position} z-50` : ""} 
          flex items-center justify-center rounded-full cursor-pointer 
          ${bgColor} ${size} 
          ${shadow ? "shadow-lg" : "shadow-none"}`}
          onClick={handleClick}
        >
          {icon || <Plus color="white" size={isMobile ? 20 : 35} />}
        </div>
      )}

      {open && children && <div>{children}</div>}
    </>
  );
}
