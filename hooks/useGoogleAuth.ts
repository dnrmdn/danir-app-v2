"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";

const GOOGLE_AUTH_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async (callbackURL = "/calendar") => {
    if (!GOOGLE_AUTH_ENABLED) {
      setError("Google login belum dikonfigurasi di environment.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signIn.social({
        provider: "google",
        callbackURL,
      });
    } catch (err) {
      console.error(err);
      setError("Gagal memulai login Google. Coba lagi.");
      setLoading(false);
    }
  };

  return {
    googleAuthEnabled: GOOGLE_AUTH_ENABLED,
    googleLoading: loading,
    googleError: error,
    signInWithGoogle,
  };
}
