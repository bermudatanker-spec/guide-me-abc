"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { authService } from "@/lib/supabase/client";
import type {
  User,
  Session,
  AuthChangeEvent,
} from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;

  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error: unknown }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // stabiele service referentie (handig voor tests/mocks)
  const service = useMemo(() => authService, []);

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    // 1) Live auth-state updates
    const {
      data: { subscription },
    } = service.onAuthStateChange(
      (_event: AuthChangeEvent, newSession: Session | null) => {
        if (!alive) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    );

    // 2) Huidige sessie ophalen bij mount
    (async () => {
      try {
        const { session: current } = await service.getSession();
        if (!alive) return;
        setSession(current ?? null);
        setUser(current?.user ?? null);
      } catch {
        if (!alive) return;
        setSession(null);
        setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      subscription?.unsubscribe();
    };
  }, [service]);

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      const { error } = await service.signUp(email, password, fullName);
      return { error };
    },
    [service]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await service.signIn(email, password);
      return { error };
    },
    [service]
  );

  const signOut = useCallback(async () => {
    await service.signOut();
    setUser(null);
    setSession(null);
  }, [service]);

  const refresh = useCallback(async () => {
    const { session: current } = await service.getSession();
    setSession(current ?? null);
    setUser(current?.user ?? null);
  }, [service]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    refresh,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}