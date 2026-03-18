"use client";

import { Button } from "@/components/ui/button";

type GoogleAuthButtonProps = {
  mode: "login" | "signup";
  onClick: () => Promise<void> | void;
  disabled?: boolean;
};

export function GoogleAuthButton({ mode, onClick, disabled }: GoogleAuthButtonProps) {
  return (
    <Button
      variant="outline"
      type="button"
      onClick={() => void onClick()}
      disabled={disabled}
      className="h-12 w-full rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4 6.8 2.4 2.6 6.6 2.6 11.8S6.8 21.2 12 21.2c6.9 0 9.1-4.8 9.1-7.3 0-.5-.1-.9-.1-1.3H12Z" />
        <path fill="#34A853" d="M2.6 11.8c0 1.7.4 3.2 1.2 4.6l3.5-2.7c-.2-.6-.4-1.2-.4-1.9s.1-1.3.4-1.9L3.8 7.2c-.8 1.4-1.2 2.9-1.2 4.6Z" />
        <path fill="#4A90E2" d="M12 21.2c2.7 0 4.9-.9 6.6-2.5l-3.2-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.2l-3.6 2.8c1.6 3.1 4.8 5.5 9.2 5.5Z" />
        <path fill="#FBBC05" d="M6.4 12.9c-.2-.6-.4-1.2-.4-1.9s.1-1.3.4-1.9L2.8 6.3C2 7.7 1.6 9.2 1.6 10.9s.4 3.2 1.2 4.6l3.6-2.6Z" />
      </svg>
      {mode === "login" ? "Log in with Google" : "Continue with Google"}
    </Button>
  );
}
