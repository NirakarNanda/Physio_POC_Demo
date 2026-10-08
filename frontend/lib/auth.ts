"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type User } from "@/lib/api";

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    let alive = true;
    api
      .me()
      .then((r) => {
        if (alive) setState({ user: r.user, loading: false });
      })
      .catch(() => {
        if (alive) setState({ user: null, loading: false });
      });
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const r = await api.login(email, password);
      setState({ user: r.user, loading: false });
      router.replace("/dashboard");
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    setState({ user: null, loading: false });
    router.replace("/login");
  }, [router]);

  return { ...state, login, logout };
}

/** Redirects to /login when the session is invalid. Returns auth state. */
export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!auth.loading && !auth.user) router.replace("/login");
  }, [auth.loading, auth.user, router]);
  return auth;
}
