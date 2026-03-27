"use client";

import type { Role } from "@/shared/types";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { verifyIdentity } from "../services/authService";
import type { CurrentUser } from "../types";

// Guardamos el usuario en sessionStorage para persistir entre navegaciones
const USER_KEY = "medicall_user";

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUser = useCallback((): CurrentUser | null => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }, []);

  const login = useCallback(
    async (email: string, docNumber: string, role: Role) => {
      setLoading(true);
      setError(null);
      try {
        const user = await verifyIdentity(email, docNumber, role);
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
        router.push("/dashboard");
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Ocurrió un error inesperado");
        }
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem(USER_KEY);
    router.push("/");
  }, [router]);

  return { login, logout, getUser, loading, error };
}
