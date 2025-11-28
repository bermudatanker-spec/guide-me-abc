// contexts/AuthContext.tsx
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

export type Role = "admin" | "user";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;

  /** rollen uit Supabase app_metadata/raw_app_meta_data */
  role: Role;
  isAdmin: boolean;

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
  const [role, setRole] = useState<Role>("user");

  /** Helper om rol uit session te halen */
  function deriveRole(sess: Session | null): Role {
    const u = sess?.user;
    if (!u) return "user";

    // Supabase kan het onder raw_app_meta_data of app_metadata zetten
    const raw: any = (u as any).raw_app_meta_data ?? {};
    const meta: any = (u as any).app_metadata ?? {};

    const fromRaw = Array.isArray(raw.roles) ? raw.roles[0] : raw.role;
    const fromMeta = Array.isArray(meta.roles) ? meta.roles[0] : meta.role;

    const r = (fromRaw ?? fromMeta ?? "user") as string;

    return r === "admin" ? "admin" : "user";
  }

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
        setRole(deriveRole(newSession));
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
        setRole(deriveRole(current ?? null));
      } catch {
        if (!alive) return;
        setSession(null);
        setUser(null);
        setRole("user");
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
    setRole("user");
  }, [service]);

  const refresh = useCallback(async () => {
    const { session: current } = await service.getSession();
    setSession(current ?? null);
    setUser(current?.user ?? null);
    setRole(deriveRole(current ?? null));
  }, [service]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    role,
    isAdmin: role === "admin",
    signUp,
    signIn,
    signOut,
    refresh,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}