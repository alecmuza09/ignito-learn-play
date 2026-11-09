import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { clearActiveLearner } from "@/lib/profile";

export interface AccountProfile {
  id: string;
  email: string | null;
  display_name: string;
  suspended: boolean;
}

interface AuthState {
  ready: boolean;
  session: Session | null;
  user: User | null;
  account: AccountProfile | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthState>({
  ready: false,
  session: null,
  user: null,
  account: null,
  isAdmin: false,
  signOut: async () => {},
});

async function signOut() {
  clearActiveLearner();
  await supabase.auth.signOut();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [account, setAccount] = useState<AccountProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Listener first so no auth event is missed between getSession and subscribe.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) clearActiveLearner();
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) {
      setAccount(null);
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    // Deferred so we never await Supabase inside the auth callback chain.
    setTimeout(async () => {
      const [{ data: prof }, { data: roles }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, email, display_name, suspended")
          .eq("id", userId)
          .maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
      ]);
      if (cancelled) return;
      if (prof?.suspended) {
        await signOut();
        if (typeof window !== "undefined") window.location.assign("/auth?suspendida=1");
        return;
      }
      setAccount(prof ?? null);
      setIsAdmin(!!roles?.some((r) => r.role === "admin"));
      void supabase
        .from("profiles")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", userId);
    }, 0);
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <AuthCtx.Provider
      value={{ ready, session, user: session?.user ?? null, account, isAdmin, signOut }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
