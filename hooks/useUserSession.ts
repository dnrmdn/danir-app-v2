"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";

export function useUserSession() {
  const router = useRouter();
  const { data: session } = useSession();

  if (!session) {
    return { user: null, session: null, handleSignOut: async () => {} };
  }

  const user = {
    name: session.user?.name || "Unknown User",
    email: session.user?.email || "No email",
    avatar: session.user?.image || "/default-avatar.png",
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return { user, session, handleSignOut };
}
