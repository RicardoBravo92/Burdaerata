"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";

/**
 * Keeps the shared `api` singleton always up-to-date with the current
 * Clerk session token. Must be rendered inside <ClerkProvider>.
 */
export default function ClerkApiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      api.clearToken();
      return;
    }

    // Set token immediately, then refresh every 50 seconds
    // (Clerk tokens expire after ~60s)
    const syncToken = async () => {
      const token = await getToken();
      if (token) api.setToken(token);
    };

    syncToken();
    const interval = setInterval(syncToken, 50_000);
    return () => clearInterval(interval);
  }, [isSignedIn, getToken]);

  return <>{children}</>;
}
