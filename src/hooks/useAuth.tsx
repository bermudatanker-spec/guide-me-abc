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
import type {
  User,
  Session,
  AuthChangeEvent,
} from "@supabase/supabase-js";

import { supabaseBrowser } from "@/lib/supabase/browser";

/* --------------------------------------------------------------------------
   TYPES
-------------------------------------------------------------------------- */

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;

  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

/* --------------------------------------------------------------------------
   CONTEXT
-------------------------------------------------------------------------- */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/* --------------------------------------------------------------------------
   PROVIDER
-------------------------------------------------------------------------- */

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  /* -------------------------- Initial session load -------------------------- */

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) return;

        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
      } finally {
        if (active) setLoading(false);
      }
    };

    init();

    /* -------------------- Supabase auth state subscription ------------------- */

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, sess: Session | null) => {
        if (!active) return;
        setSession(sess);
        setUser(sess?.user ?? null);
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  /* --------------------------- AUTH ACTIONS --------------------------- */

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    },
    [supabase]
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: fullName ? { full_name: fullName } : {},
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });
      return { error };
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, [supabase]);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session ?? null);
    setUser(data.session?.user ?? null);
  }, [supabase]);

  /* ---------------------------- RESULT VALUE --------------------------- */

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
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}