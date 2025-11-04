"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";



export function useUserSession() {
  const router = useRouter();

  // ✅ Ambil data user dari session
  const { data: session } = useSession();

  // Jika tidak ada session (belum login)
  if (!session) {
    return { user: null, session: null};
  }

  const user = {
    name: session.user?.name || "Unknown User",
    email: session.user?.email || "No email",
    avatar: session.user?.image || "/default-avatar.png",
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return { user, session, handleSignOut };
}
