"use client"
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useUserSession } from "@/hooks/useUserSession";
import { useEffect, useState } from "react";

export default function Navbar() {

    const { isPending } = useAuthGuard();
      const { user, session } = useUserSession();
    
      const [loginState, setLoginState] = useState<"first-ever" | "first-this-session" | "returning" | null>(null);
    
      useEffect(() => {
        if (isPending || !session || !user?.email) return;
    
        const userKey = user.email;
        const localKey = `hasLoggedIn-${userKey}`;
        const sessionKey = `sessionActive-${userKey}`;
    
        const hasLoggedInBefore = localStorage.getItem(localKey);
        const hasSessionActive = sessionStorage.getItem(sessionKey);
    
        // Run after render commit (avoid hydration mismatch)
        queueMicrotask(() => {
          if (!hasLoggedInBefore) {
            // 🆕 First login ever (new account on this browser)
            localStorage.setItem(localKey, "true");
            sessionStorage.setItem(sessionKey, "true");
            setLoginState("first-ever");
          } else if (!hasSessionActive) {
            // 🔁 Returning user, new browser session
            sessionStorage.setItem(sessionKey, "true");
            setLoginState("first-this-session");
          } else {
            // 🔄 Same session refresh
            setLoginState("returning");
          }
        });
      }, [isPending, session, user?.email]);
    
      if (isPending) {
        return (
          <div className="flex min-h-screen items-center justify-center">
            <p>Loading...</p>
          </div>
        );
      }
    
      if (!session || !user) {
        return <div className="p-4 text-sm text-muted-foreground">Not signed in</div>;
      }

  return (
    <nav className="p-4">
        <div className="flex items-center">
            {loginState === "first-ever" ? (
              <h1>🎉 Welcome {user.name}!</h1>
            ) : (
              <h1>✨ Welcome back {user.name}!</h1>
            )}
        </div>
    </nav>
  )
}
